import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { XMLParser } from 'fast-xml-parser';
import { DeputadoEstadual, DespesaEstadual } from '@prisma/client';
import {
  DEPUTADO_ESTADUAL_REPOSITORY,
  type DeputadoEstadualRepository,
} from 'src/repositories/estadual/deputado-estadual.repository';
import {
  DESPESA_ESTADUAL_REPOSITORY,
  type DespesaEstadualRepository,
} from 'src/repositories/estadual/despesa-estadual.repository';

@Injectable()
export class AlespService {
  private readonly logger = new Logger(AlespService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(DEPUTADO_ESTADUAL_REPOSITORY)
    private readonly deputadoEstadualRepository: DeputadoEstadualRepository,
    @Inject(DESPESA_ESTADUAL_REPOSITORY)
    private readonly despesaEstadualRepository: DespesaEstadualRepository,
  ) {}

  async syncDeputadosEstaduaisToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting synchronization of ALESP state deputies...');
    try {
      const url = 'http://www.al.sp.gov.br/repositorioDados/deputados/deputados.xml';
      const response = await firstValueFrom(this.httpService.get(url, { responseType: 'text' }));
      const xmlText = response.data;

      const parser = new XMLParser({ processEntities: false });
      const json = parser.parse(xmlText);

      if (!json.Deputados || !json.Deputados.Deputado) {
        throw new Error('Invalid XML structure received from ALESP.');
      }

      const rawList = json.Deputados.Deputado;
      const xmlDeputados = Array.isArray(rawList) ? rawList : [rawList];

      const mappedDeputados: any[] = [];

      this.logger.log(`Found ${xmlDeputados.length} deputies in XML. Fetching detail profiles...`);

      const chunkSize = 10;
      for (let i = 0; i < xmlDeputados.length; i += chunkSize) {
        const chunk = xmlDeputados.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (dep) => {
            const matricula = Number(dep.Matricula);
            let details: any = null;
            try {
              const detailsResp = await firstValueFrom(
                this.httpService.get(
                  `https://legis-api-portal-prd.al.sp.gov.br/parlamentar-portal/detalhes/${matricula}`,
                  { timeout: 5000 }
                ),
              );
              details = detailsResp.data;
            } catch (err: any) {
              this.logger.warn(`Could not fetch details for deputy matricula ${matricula}, using XML fallback: ${err.message}`);
            }

            const urlFoto = details?.biografia?.txFotoGrande
              ? 'https://www3.al.sp.gov.br/legis/' + details.biografia.txFotoGrande.substring(1)
              : null;

            mappedDeputados.push({
              idDeputado: Number(dep.IdDeputado),
              idSPL: String(dep.IdSPL),
              idUA: Number(dep.IdUA),
              matricula,
              situacao: String(dep.Situacao),
              andar: dep.Andar ? String(dep.Andar) : null,
              aniversario: dep.Aniversario ? String(dep.Aniversario) : null,
              nome: details?.txNomeParlamentar || String(dep.NomeParlamentar),
              siglaPartido: details?.txPartido || String(dep.Partido),
              biografia: dep.Biografia ? String(dep.Biografia) : null,
              email: details?.biografia?.txEmail || dep.Email || null,
              telefone: details?.biografia?.nuRamal || dep.Telefone || null,
              sala: details?.biografia?.nuSala ? String(details.biografia.nuSala) : (dep.Sala ? String(dep.Sala) : null),
              urlFoto,
            });
          }),
        );
      }

      await this.deputadoEstadualRepository.deleteAll();
      await this.deputadoEstadualRepository.createMany(mappedDeputados);
      this.logger.log(`ALESP state deputies sync completed. Synced: ${mappedDeputados.length}`);
      return { synced: mappedDeputados.length };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to sync ALESP deputies: ${errMsg}`);
      throw error;
    }
  }

  async syncDespesasEstaduaisAllToDb(filterAno?: number): Promise<{ synced: number }> {
    this.logger.log('Starting batch sync of ALESP cabinet expenses...');
    try {
      const localDeputados = await this.deputadoEstadualRepository.findAll();
      if (localDeputados.length === 0) {
        this.logger.warn('No local state deputies found. Sincronizing deputies list first...');
        await this.syncDeputadosEstaduaisToDb();
      }

      const deputies = await this.deputadoEstadualRepository.findAll();
      const matriculaToIdMap = new Map<number, number>();
      for (const d of deputies) {
        matriculaToIdMap.set(d.matricula, d.idDeputado);
      }

      const url = 'http://www.al.sp.gov.br/repositorioDados/deputados/despesas_gabinetes.xml';
      const response = await firstValueFrom(this.httpService.get(url, { responseType: 'text' }));
      const xmlText = response.data;

      const parser = new XMLParser({ processEntities: false });
      const json = parser.parse(xmlText);

      if (!json.despesas || !json.despesas.despesa) {
        throw new Error('Invalid despesas XML structure received from ALESP.');
      }

      const rawList = json.despesas.despesa;
      const xmlExpenses = Array.isArray(rawList) ? rawList : [rawList];

      let yearsToSync: number[] = [];
      if (filterAno !== undefined) {
        yearsToSync = [filterAno];
      } else {
        let maxYear = 0;
        for (const exp of xmlExpenses) {
          const y = Number(exp.Ano);
          if (y > maxYear) maxYear = y;
        }
        if (maxYear === 0) maxYear = new Date().getFullYear();
        yearsToSync = [maxYear - 1, maxYear];
      }

      this.logger.log(`Syncing expenses for years: ${yearsToSync.join(', ')}...`);

      const expensesMapped: any[] = [];
      const cleanKeys = new Set<string>();

      for (const exp of xmlExpenses) {
        const ano = Number(exp.Ano);
        if (!yearsToSync.includes(ano)) continue;

        const matricula = Number(exp.Matricula);
        const idDeputado = matriculaToIdMap.get(matricula);
        if (!idDeputado) continue;

        const mes = Number(exp.Mes);
        const valor = Number(exp.Valor);
        const tipoDespesa = String(exp.Tipo);
        const cnpjCpfFornecedor = exp.CNPJ ? String(exp.CNPJ) : null;
        const nomeFornecedor = exp.Fornecedor ? String(exp.Fornecedor) : null;

        expensesMapped.push({
          idDeputado,
          ano,
          mes,
          tipoDespesa,
          cnpjCpfFornecedor,
          nomeFornecedor,
          valor,
        });

        cleanKeys.add(`${idDeputado}_${ano}`);
      }

      for (const key of cleanKeys) {
        const [idDeputadoStr, anoStr] = key.split('_');
        await this.despesaEstadualRepository.deleteManyByDeputyAndYear(
          Number(idDeputadoStr),
          Number(anoStr),
        );
      }

      const insertChunkSize = 1000;
      for (let i = 0; i < expensesMapped.length; i += insertChunkSize) {
        const chunk = expensesMapped.slice(i, i + insertChunkSize);
        await this.despesaEstadualRepository.createMany(chunk);
      }

      this.logger.log(`ALESP cabinet expenses batch sync completed. Synced: ${expensesMapped.length}`);
      return { synced: expensesMapped.length };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to sync ALESP expenses: ${errMsg}`);
      throw error;
    }
  }

  async getDeputadosEstaduais(): Promise<DeputadoEstadual[]> {
    return this.deputadoEstadualRepository.findAll();
  }

  async getAndSyncDespesasEstadual(
    idDeputado: number,
    ano?: number,
    mes?: number,
  ): Promise<DespesaEstadual[]> {
    const existing = await this.despesaEstadualRepository.findByDeputyAndFilters(idDeputado, ano, mes);
    if (existing.length === 0) {
      this.logger.log(`No expenses found in database for deputy ${idDeputado}. Triggering batch sync...`);
      await this.syncDespesasEstaduaisAllToDb(ano);
      return this.despesaEstadualRepository.findByDeputyAndFilters(idDeputado, ano, mes);
    }
    return existing;
  }
}
