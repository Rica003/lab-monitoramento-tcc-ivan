import { Injectable, Inject, Logger } from '@nestjs/common';
import { Proposicao } from '@prisma/client';
import {
  type ProposicaoRepository,
  PROPOSICAO_REPOSITORY,
} from 'src/repositories/proposicao/proposicao.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ProposicoesResponseDTO } from 'src/dtos/proposicao/proposicoes-response.dto';

@Injectable()
export class ProposicoesService {
  private readonly logger = new Logger(ProposicoesService.name);

  constructor(
    @Inject(PROPOSICAO_REPOSITORY)
    private readonly proposicaoRepository: ProposicaoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Proposicao[]> {
    return this.proposicaoRepository.findAll();
  }

  async findOne(id: number): Promise<Proposicao | null> {
    return this.proposicaoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getProposicoes(params?: any): Promise<ProposicoesResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/proposicoes',
        { params },
      ),
    );
    return ProposicoesResponseDTO.fromApiResponse(response.data);
  }

  async getProposicaoById(id: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}`,
        ),
      );
      return response.data?.dados;
    } catch (error: any) {
      if (error.response?.status === 429) {
        this.logger.warn(
          `Rate limit hit (429) for proposition ID ${id}. Retrying in 1.5s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const response = await firstValueFrom(
          this.httpService.get(
            `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}`,
          ),
        );
        return response.data?.dados;
      }
      throw error;
    }
  }

  async ensureProposicaoExists(
    idProposicao: number,
  ): Promise<Proposicao | null> {
    try {
      const existing = await this.proposicaoRepository.findByCamaraId(
        idProposicao,
      );
      if (existing) {
        if (!existing.autores) {
          try {
            const autoresResponse = await this.getProposicaoDetalhes(
              idProposicao,
              'autores',
            );
            const autores = autoresResponse.dados || [];
            await this.proposicaoRepository.upsert({
              id: existing.idCamara,
              uri: existing.uri,
              siglaTipo: existing.siglaTipo,
              codTipo: existing.codTipo,
              numero: existing.numero,
              ano: existing.ano,
              ementa: existing.ementa,
              autores,
            });
          } catch (e: any) {
            this.logger.warn(
              `Failed to backfill authors for existing proposition ${idProposicao}: ${e.message}`,
            );
          }
        }
        return existing;
      }
    } catch {
      // Not found locally, proceed to fetch
    }

    try {
      this.logger.log(
        `Proposição ${idProposicao} not found locally. Fetching from Chamber API...`,
      );
      const propApi = await this.getProposicaoById(idProposicao);
      if (!propApi) {
        return null;
      }

      let autores: any[] = [];
      try {
        const autoresResponse = await this.getProposicaoDetalhes(
          idProposicao,
          'autores',
        );
        autores = autoresResponse.dados || [];
      } catch (err: any) {
        this.logger.warn(
          `Failed to fetch authors for proposition ID ${idProposicao}: ${err.message}`,
        );
      }

      const propData = {
        id: propApi.id,
        uri: propApi.uri,
        siglaTipo: propApi.siglaTipo,
        codTipo: propApi.codTipo,
        numero: propApi.numero,
        ano: propApi.ano,
        ementa: propApi.ementa,
        autores,
      };

      await this.proposicaoRepository.upsert(propData);
      this.logger.log(
        `Proposição ${idProposicao} and ${autores.length} authors synced successfully.`,
      );
      return this.proposicaoRepository.findByCamaraId(idProposicao);
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch and save proposition ${idProposicao}: ${error.message}`,
      );
      return null;
    }
  }

  async getProposicaoDetalhes(
    id: number,
    recurso: string,
    params?: any,
  ): Promise<any> {
    const allowed = [
      'autores',
      'relacionadas',
      'temas',
      'tramitacoes',
      'votacoes',
    ];
    if (!allowed.includes(recurso))
      throw new Error(`Recurso '${recurso}' não suportado para Proposições.`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}/${recurso}`,
          { params },
        ),
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        this.logger.warn(
          `Rate limit hit (429) for proposition ID ${id} (${recurso}). Retrying in 1.5s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const response = await firstValueFrom(
          this.httpService.get(
            `https://dadosabertos.camara.leg.br/api/v2/proposicoes/${id}/${recurso}`,
            { params },
          ),
        );
        return response.data;
      }
      throw error;
    }
  }

  // --- SYNC ---
  async syncProposicoesToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of proposicoes from Camara API...');
    const response = await this.getProposicoes({
      itens: 100,
      ordem: 'DESC',
      ordenarPor: 'id',
    });
    const proposicoes = response.proposicoes;

    this.logger.log(
      `Fetched ${proposicoes.length} basic propositions. Syncing authors and upserting...`,
    );

    let count = 0;
    const chunkSize = 8;
    
    // 1. Sync the 100 newest propositions from the API
    for (let i = 0; i < proposicoes.length; i += chunkSize) {
      const chunk = proposicoes.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (p) => {
          try {
            const autoresResponse = await this.getProposicaoDetalhes(p.id, 'autores');
            p.autores = autoresResponse.dados || [];
          } catch (err: any) {
            this.logger.warn(
              `Failed to fetch authors for proposition ID ${p.id}: ${err.message}`,
            );
            p.autores = [];
          }
          await this.proposicaoRepository.upsert(p);
          count++;
        }),
      );
    }

    // 2. Backfill existing propositions in DB that do not have authors
    this.logger.log('Checking for legacy propositions in DB without authors for backfill...');
    const allLocal = await this.proposicaoRepository.findAll();
    const legacyWithoutAutores = allLocal.filter((p) => !p.autores);

    if (legacyWithoutAutores.length > 0) {
      this.logger.log(
        `Found ${legacyWithoutAutores.length} legacy propositions without authors. Backfilling...`,
      );

      let backfilledCount = 0;
      for (let i = 0; i < legacyWithoutAutores.length; i += chunkSize) {
        const chunk = legacyWithoutAutores.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (p) => {
            try {
              const idCamara = p.idCamara;
              const autoresResponse = await this.getProposicaoDetalhes(idCamara, 'autores');
              const autores = autoresResponse.dados || [];

              const mappedProp = {
                id: idCamara,
                uri: p.uri,
                siglaTipo: p.siglaTipo,
                codTipo: p.codTipo,
                numero: p.numero,
                ano: p.ano,
                ementa: p.ementa,
                autores: autores,
              };

              await this.proposicaoRepository.upsert(mappedProp);
              backfilledCount++;
            } catch (err: any) {
              this.logger.error(
                `Failed to backfill authors for legacy proposition ID ${p.idCamara}: ${err.message}`,
              );
            }
          }),
        );
      }
      this.logger.log(`Backfill completed. Updated ${backfilledCount} legacy propositions.`);
    }

    this.logger.log(
      `Sync completed. Successfully upserted ${count} new proposicoes and backfilled legacy ones.`,
    );
    return { synced: count };
  }
}
