import { Injectable, Inject, Logger } from '@nestjs/common';
import { Deputado, Despesa } from '@prisma/client';
import {
  type DeputadoRepository,
  DEPUTADO_REPOSITORY,
} from 'src/repositories/deputado/deputado.repository';
import {
  type DiscursoRepository,
  DISCURSO_REPOSITORY,
} from 'src/repositories/discurso/discurso.repository';
import {
  type DespesaRepository,
  DESPESA_REPOSITORY,
} from 'src/repositories/deputado/despesa.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DeputadosResponseDTO } from 'src/dtos/deputado/deputados-response.dto';
import {
  DeputadoDTO,
  DeputadoAPIResponse,
} from 'src/dtos/deputado/deputado.dto';
import { DespesaDTO, DespesaAPIResponse } from 'src/dtos/deputado/despesa.dto';

@Injectable()
export class DeputadosService {
  private readonly logger = new Logger(DeputadosService.name);

  constructor(
    @Inject(DEPUTADO_REPOSITORY)
    private readonly deputadoRepository: DeputadoRepository,
    @Inject(DISCURSO_REPOSITORY)
    private readonly discursoRepository: DiscursoRepository,
    @Inject(DESPESA_REPOSITORY)
    private readonly despesaRepository: DespesaRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Deputado[]> {
    return this.deputadoRepository.findAll();
  }

  async findOne(id: number): Promise<Deputado | null> {
    return this.deputadoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getDeputados(params?: any): Promise<DeputadosResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/deputados',
        { params },
      ),
    );
    return DeputadosResponseDTO.fromApiResponse(response.data);
  }

  async getDeputadoById(id: number): Promise<DeputadoDTO> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ dados: DeputadoAPIResponse }>(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}`,
        ),
      );
      return DeputadoDTO.fromApiResponse(response.data.dados);
    } catch (error: any) {
      if (error.response?.status === 429) {
        this.logger.warn(
          `Rate limit hit (429) for deputy ID ${id}. Retrying in 1.5s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const response = await firstValueFrom(
          this.httpService.get<{ dados: DeputadoAPIResponse }>(
            `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}`,
          ),
        );
        return DeputadoDTO.fromApiResponse(response.data.dados);
      }
      throw error;
    }
  }

  async getDeputadoDetalhes(
    id: number,
    recurso: string,
    params?: any,
  ): Promise<any> {
    const allowed = [
      'despesas',
      'discursos',
      'eventos',
      'frentes',
      'historico',
      'mandatosExternos',
      'ocupacoes',
      'orgaos',
      'profissoes',
    ];
    if (!allowed.includes(recurso)) {
      throw new Error(
        `Recurso '${recurso}' não é suportado pela API da Câmara para Deputados.`,
      );
    }
    const response = await firstValueFrom(
      this.httpService.get(
        `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}/${recurso}`,
        { params },
      ),
    );
    return response.data;
  }

  // --- SYNC ---
  async syncDeputadosToDb(): Promise<{ synced: number }> {
    this.logger.log(
      'Starting sync of all deputados from Camara API with enriched details...',
    );
    const limitParams = { itens: 1000 };
    const response = await this.getDeputados(limitParams);
    const activeDeputados = response.deputados;
    const activeIds = new Set(activeDeputados.map((d) => d.id));

    // Fetch local deputies to find inactive ones later
    const localDeputados = await this.deputadoRepository.findAll();
    const localIds = localDeputados.map((d) => d.idCamara);

    this.logger.log(
      `Fetched ${activeDeputados.length} active basic deputados. Fetching individual details and upserting...`,
    );

    let count = 0;
    const chunkSize = 8;
    
    // Process active deputies in concurrent chunks
    for (let i = 0; i < activeDeputados.length; i += chunkSize) {
      const chunk = activeDeputados.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (dep) => {
          try {
            const detailedDep = await this.getDeputadoById(dep.id);
            await this.deputadoRepository.upsert(detailedDep);
          } catch (error: any) {
            this.logger.error(
              `Failed to fetch detailed info for deputado ${dep.nome} (ID: ${dep.id}): ${error.message}`,
            );
            // Fallback for basic data in case individual fetch fails
            await this.deputadoRepository.upsert(dep);
          }
          count++;
        }),
      );

      this.logger.log(
        `Processed ${count}/${activeDeputados.length} active deputados...`,
      );
    }

    // Identify and update status of former deputies
    const inactiveIds = localIds.filter((id) => !activeIds.has(id));
    if (inactiveIds.length > 0) {
      this.logger.log(
        `Found ${inactiveIds.length} potentially inactive/former deputados. Updating their status...`,
      );

      for (const inactiveId of inactiveIds) {
        try {
          const detailedDep = await this.getDeputadoById(inactiveId);
          await this.deputadoRepository.upsert(detailedDep);
          this.logger.log(
            `Updated status for inactive deputado ID ${inactiveId} -> ${detailedDep.situacao || 'Inativo'}`,
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to update status for inactive deputado ID ${inactiveId}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Sync completed. Successfully upserted ${count} active deputados and updated ${inactiveIds.length} former ones.`,
    );
    return { synced: count };
  }

  async syncDiscursosToDb(): Promise<{ synced: number }> {
    this.logger.log(
      'Starting sync of speeches (discursos) for all deputados from the last 60 days...',
    );

    // Calculate 850 days ago
    const today = new Date();
    const dataInicioDate = new Date();
    dataInicioDate.setDate(today.getDate() - 850);

    const dataInicio = dataInicioDate.toISOString().split('T')[0];
    const dataFim = today.toISOString().split('T')[0];

    // Get all deputies from our local DB
    const deputadosLocal = await this.deputadoRepository.findAll();
    this.logger.log(
      `Found ${deputadosLocal.length} deputados in local database. Processing speeches...`,
    );

    let totalSynced = 0;
    for (const dep of deputadosLocal) {
      try {
        const response = await this.getDeputadoDetalhes(
          dep.idCamara,
          'discursos',
          {
            dataInicio,
            dataFim,
            itens: 100, // Limit per deputy
          },
        );

        const discursos = response.dados || [];
        for (const disc of discursos) {
          await this.discursoRepository.upsert(dep.idCamara, disc);
          totalSynced++;
        }
      } catch (error) {
        this.logger.error(
          `Error syncing speeches for deputy ${dep.nome} (${dep.idCamara}): ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Speech sync completed. Successfully upserted ${totalSynced} speeches.`,
    );
    return { synced: totalSynced };
  }

  async getAndSyncDespesas(
    idCamaraDeputado: number,
    query: Record<string, any>,
  ): Promise<Despesa[]> {
    const filterAno = query.ano ? Number(query.ano) : undefined;
    const filterMes = query.mes ? Number(query.mes) : undefined;

    let yearsToSync: number[] = [];
    if (filterAno !== undefined) {
      yearsToSync = [filterAno];
    } else {
      let realCurrentYear = new Date().getFullYear();
      try {
        const sample = await firstValueFrom(
          this.httpService.get<{ dados: any[] }>(
            `https://dadosabertos.camara.leg.br/api/v2/deputados/${idCamaraDeputado}/despesas`,
            { params: { itens: 1 } }
          )
        );
        if (sample.data?.dados?.length > 0) {
          realCurrentYear = Number(sample.data.dados[0].ano);
        }
      } catch {
        // ignore
      }
      yearsToSync = [realCurrentYear - 1, realCurrentYear];
    }

    try {
      for (const currentSyncYear of yearsToSync) {
        this.logger.log(
          `Syncing expenses for deputy ${idCamaraDeputado} and year ${currentSyncYear}...`,
        );
        let pagina = 1;
        let hasMore = true;
        const allExpenses: DespesaAPIResponse[] = [];

        while (hasMore) {
          const params: Record<string, any> = { ...query, pagina, itens: 100 };
          params.ano = currentSyncYear;

          const response = await firstValueFrom(
            this.httpService.get<{ dados: DespesaAPIResponse[]; links: Array<{ rel: string; href: string }> }>(
              `https://dadosabertos.camara.leg.br/api/v2/deputados/${idCamaraDeputado}/despesas`,
              { params },
            ),
          );
          const pageData = response.data.dados || [];
          allExpenses.push(...pageData);

          const links = response.data.links || [];
          const hasNextLink = links.some((l) => l.rel === 'next');
          if (hasNextLink && pageData.length > 0) {
            pagina++;
          } else {
            hasMore = false;
          }
        }

        const despesasMapped = allExpenses.map((d) => {
          const dto = DespesaDTO.fromApiResponse(d);
          return {
            idCamaraDeputado,
            ano: dto.ano,
            mes: dto.mes,
            tipoDespesa: dto.tipoDespesa,
            codDocumento: dto.codDocumento,
            tipoDocumento: dto.tipoDocumento,
            codTipoDocumento: dto.codTipoDocumento,
            dataDocumento: dto.dataDocumento,
            numDocumento: dto.numDocumento,
            valorDocumento: dto.valorDocumento,
            urlDocumento: dto.urlDocumento,
            nomeFornecedor: dto.nomeFornecedor,
            cnpjCpfFornecedor: dto.cnpjCpfFornecedor,
            valorLiquido: dto.valorLiquido,
            valorGlosa: dto.valorGlosa,
            numRessarcimento: dto.numRessarcimento,
            codLote: dto.codLote,
            parcela: dto.parcela,
          };
        });

        await this.despesaRepository.deleteManyByDeputyAndYear(
          idCamaraDeputado,
          currentSyncYear,
        );
        await this.despesaRepository.createMany(despesasMapped);
      }
      this.logger.log(
        `Expenses synced successfully for deputy ${idCamaraDeputado} for years: ${yearsToSync.join(', ')}`,
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to sync expenses from Chamber API for deputy ${idCamaraDeputado}: ${errMsg}`,
      );
    }

    return this.despesaRepository.findByDeputyIdAndFilters(
      idCamaraDeputado,
      filterAno,
      filterMes,
    );
  }

  async syncDespesasAllDeputadosToDb(ano?: number): Promise<{ synced: number }> {
    let yearsToSync: number[] = [];
    if (ano !== undefined) {
      yearsToSync = [ano];
    } else {
      let realCurrentYear = new Date().getFullYear();
      try {
        const sample = await firstValueFrom(
          this.httpService.get<{ dados: any[] }>(
            `https://dadosabertos.camara.leg.br/api/v2/deputados/220593/despesas`,
            { params: { itens: 1 } }
          )
        );
        if (sample.data?.dados?.length > 0) {
          realCurrentYear = Number(sample.data.dados[0].ano);
        }
      } catch (err) {
        this.logger.warn(`Failed to detect real current year, falling back to system clock: ${err instanceof Error ? err.message : String(err)}`);
      }
      yearsToSync = [realCurrentYear - 1, realCurrentYear];
    }

    const yearLabel = yearsToSync.join(', ');
    this.logger.log(
      `Starting sync of expenses for all deputies for years: ${yearLabel}...`,
    );
    const deputados = await this.deputadoRepository.findAll();
    let count = 0;
    for (const dep of deputados) {
      try {
        for (const y of yearsToSync) {
          await this.getAndSyncDespesas(dep.idCamara, { ano: y });
        }
        count++;
        if (count % 50 === 0) {
          this.logger.log(
            `Synced expenses for ${count}/${deputados.length} deputies...`,
          );
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error syncing expenses for deputy ${dep.nome} (${dep.idCamara}): ${errMsg}`,
        );
      }
    }
    this.logger.log(
      `Finished syncing expenses for all deputies. Total deputies synced: ${count}`,
    );
    return { synced: count };
  }
}
