import { Injectable, Inject, Logger } from '@nestjs/common';
import { Votacao, VotoIndividual, Orientacao } from '@prisma/client';
import {
  type VotacaoRepository,
  VOTACAO_REPOSITORY,
} from 'src/repositories/votacao/votacao.repository';
import {
  type VotoIndividualRepository,
  VOTO_INDIVIDUAL_REPOSITORY,
} from 'src/repositories/votacao/voto-individual.repository';
import {
  type OrientacaoRepository,
  ORIENTACAO_REPOSITORY,
} from 'src/repositories/votacao/orientacao.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { VotacoesResponseDTO } from 'src/dtos/votacao/votacoes-response.dto';
import { VotoIndividualDTO, VotoIndividualAPIResponse } from 'src/dtos/votacao/voto-individual.dto';
import { OrientacaoDTO, OrientacaoAPIResponse } from 'src/dtos/votacao/orientacao.dto';
import { ProposicoesService } from './proposicoes.service';
import { LegislaturasService } from './legislaturas.service';

@Injectable()
export class VotacoesService {
  private readonly logger = new Logger(VotacoesService.name);

  constructor(
    @Inject(VOTACAO_REPOSITORY)
    private readonly votacaoRepository: VotacaoRepository,
    @Inject(VOTO_INDIVIDUAL_REPOSITORY)
    private readonly votoIndividualRepository: VotoIndividualRepository,
    @Inject(ORIENTACAO_REPOSITORY)
    private readonly orientacaoRepository: OrientacaoRepository,
    private readonly httpService: HttpService,
    private readonly proposicoesService: ProposicoesService,
    private readonly legislaturasService: LegislaturasService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Votacao[]> {
    return this.votacaoRepository.findAll();
  }

  async findOne(id: string): Promise<Votacao | null> {
    return this.votacaoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getVotacoes(params?: any): Promise<VotacoesResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/votacoes',
        { params },
      ),
    );
    return VotacoesResponseDTO.fromApiResponse(response.data);
  }

  async getVotacaoDetalhes(
    id: string,
    recurso: string,
    params?: any,
  ): Promise<any> {
    const allowed = ['orientacoes', 'votos'];
    if (!allowed.includes(recurso))
      throw new Error(`Recurso '${recurso}' não suportado para Votações.`);
    const response = await firstValueFrom(
      this.httpService.get(
        `https://dadosabertos.camara.leg.br/api/v2/votacoes/${id}/${recurso}`,
        { params },
      ),
    );
    return response.data;
  }

  // --- SYNC ---
  async syncVotacoesToDb(
    customDataInicio?: string,
  ): Promise<{ synced: number }> {
    let dataInicio = customDataInicio;
    if (!dataInicio) {
      const currentLeg = await this.legislaturasService.getCurrentLegislatura();
      if (currentLeg?.dataInicio) {
        dataInicio =
          currentLeg.dataInicio instanceof Date
            ? currentLeg.dataInicio.toISOString().split('T')[0]
            : String(currentLeg.dataInicio).split('T')[0];
      } else {
        dataInicio = '2023-02-01';
      }
      this.logger.log(
        `Dynamic legislature detected: ${currentLeg?.idCamara || '57'}ª Legislatura (início: ${dataInicio})`,
      );
    }

    this.logger.log(
      `Starting sync of all votacoes from Camara API (dataInicio: ${dataInicio})...`,
    );

    let pagina = 1;
    let hasNextPage = true;
    let count = 0;
    const chunkSize = 15;

    while (hasNextPage) {
      this.logger.log(`Fetching page ${pagina} of votacoes...`);
      const response = await this.getVotacoes({
        dataInicio,
        itens: 100,
        pagina,
        ordem: 'DESC',
        ordenarPor: 'dataHoraRegistro',
      });

      const votacoes = response.votacoes;
      if (!votacoes || votacoes.length === 0) {
        break;
      }

      for (let i = 0; i < votacoes.length; i += chunkSize) {
        const chunk = votacoes.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (v) => {
            await this.votacaoRepository.upsert(v);
            count++;
          }),
        );
      }

      const nextLink = response.links?.find((l) => l.rel === 'next');
      if (nextLink && votacoes.length === 100) {
        pagina++;
      } else {
        hasNextPage = false;
      }
    }

    this.logger.log(
      `Sync completed. Successfully upserted ${count} votacoes from legislature (${dataInicio} to present).`,
    );
    return { synced: count };
  }

  async getAndSyncVotos(
    idCamaraVotacao: string,
    query: Record<string, any>,
  ): Promise<VotoIndividual[]> {
    try {
      this.logger.log(
        `Syncing individual votes for voting ${idCamaraVotacao}...`,
      );

      let response;
      try {
        response = await firstValueFrom(
          this.httpService.get<{ dados: VotoIndividualAPIResponse[] }>(
            `https://dadosabertos.camara.leg.br/api/v2/votacoes/${idCamaraVotacao}/votos`,
            { params: query },
          ),
        );
      } catch (err: any) {
        if (err.response?.status === 429) {
          this.logger.warn(
            `Rate limit (429) on votes for voting ${idCamaraVotacao}. Retrying in 1.5s...`,
          );
          await new Promise((r) => setTimeout(r, 1500));
          response = await firstValueFrom(
            this.httpService.get<{ dados: VotoIndividualAPIResponse[] }>(
              `https://dadosabertos.camara.leg.br/api/v2/votacoes/${idCamaraVotacao}/votos`,
              { params: query },
            ),
          );
        } else {
          throw err;
        }
      }

      const allVotes = response.data?.dados || [];

      const votosMapped = allVotes.map((v) => {
        const dto = VotoIndividualDTO.fromApiResponse(v);
        return {
          idCamaraVotacao,
          idCamaraDeputado: dto.idCamaraDeputado,
          nomeDeputado: dto.nome,
          siglaPartido: dto.siglaPartido,
          siglaUf: dto.siglaUf,
          idLegislatura: dto.idLegislatura,
          voto: dto.voto,
          dataHoraRegistro: dto.dataHoraRegistro,
        };
      });

      await this.votoIndividualRepository.deleteManyByVotingId(idCamaraVotacao);
      await this.votoIndividualRepository.createMany(votosMapped);
      this.logger.log(
        `Votes synced successfully for voting ${idCamaraVotacao}. Total: ${votosMapped.length}`,
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to sync votes from Chamber API for voting ${idCamaraVotacao}: ${errMsg}`,
      );
    }

    return this.votoIndividualRepository.findByVotingId(idCamaraVotacao);
  }

  async getAndSyncOrientacoes(
    idCamaraVotacao: string,
    query: Record<string, any>,
  ): Promise<Orientacao[]> {
    try {
      this.logger.log(`Syncing orientations for voting ${idCamaraVotacao}...`);

      let response;
      try {
        response = await firstValueFrom(
          this.httpService.get<{ dados: OrientacaoAPIResponse[] }>(
            `https://dadosabertos.camara.leg.br/api/v2/votacoes/${idCamaraVotacao}/orientacoes`,
            { params: query },
          ),
        );
      } catch (err: any) {
        if (err.response?.status === 429) {
          this.logger.warn(
            `Rate limit (429) on orientations for voting ${idCamaraVotacao}. Retrying in 1.5s...`,
          );
          await new Promise((r) => setTimeout(r, 1500));
          response = await firstValueFrom(
            this.httpService.get<{ dados: OrientacaoAPIResponse[] }>(
              `https://dadosabertos.camara.leg.br/api/v2/votacoes/${idCamaraVotacao}/orientacoes`,
              { params: query },
            ),
          );
        } else {
          throw err;
        }
      }

      const allOrientacoes = response.data?.dados || [];

      const orientacoesMapped = allOrientacoes.map((o) => {
        const dto = OrientacaoDTO.fromApiResponse(o);
        return {
          idCamaraVotacao,
          codOrgao: dto.codOrgao,
          siglaOrgao: dto.siglaOrgao,
          uriOrgao: dto.uriOrgao,
          codPartido: dto.codPartido,
          siglaPartido: dto.siglaPartido,
          uriPartido: dto.uriPartido,
          orientacaoVoto: dto.orientacaoVoto,
        };
      });

      await this.orientacaoRepository.deleteManyByVotingId(idCamaraVotacao);
      await this.orientacaoRepository.createMany(orientacoesMapped);
      this.logger.log(
        `Orientations synced successfully for voting ${idCamaraVotacao}. Total: ${orientacoesMapped.length}`,
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to sync orientations from Chamber API for voting ${idCamaraVotacao}: ${errMsg}`,
      );
    }

    return this.orientacaoRepository.findByVotingId(idCamaraVotacao);
  }

  async syncFullVotacoesDetails(): Promise<{
    totalVotacoes: number;
    votosSynced: number;
    orientacoesSynced: number;
    proposicoesSynced: number;
  }> {
    this.logger.log(
      'Starting full synchronization of all Votacoes details (Votes, Orientations, Propositions & Authors)...',
    );
    const votacoes = await this.votacaoRepository.findAll();
    this.logger.log(
      `Found ${votacoes.length} votacoes in database to synchronize.`,
    );

    let votosCount = 0;
    let orientacoesCount = 0;
    let proposicoesCount = 0;

    const chunkSize = 6;
    for (let i = 0; i < votacoes.length; i += chunkSize) {
      const chunk = votacoes.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (v) => {
          // 1. Sync Votos
          try {
            await this.getAndSyncVotos(v.idCamara, {});
            votosCount++;
          } catch (err: any) {
            this.logger.error(
              `Failed to sync votes for voting ${v.idCamara}: ${err.message}`,
            );
          }

          // 2. Sync Orientacoes
          try {
            await this.getAndSyncOrientacoes(v.idCamara, {});
            orientacoesCount++;
          } catch (err: any) {
            this.logger.error(
              `Failed to sync orientations for voting ${v.idCamara}: ${err.message}`,
            );
          }

          // 3. Extract proposition ID and ensure proposition + authors exist in DB
          try {
            let propId: number | null = v.idProposicaoObjeto || null;
            if (!propId && v.idCamara) {
              const beforeHyphen = v.idCamara.split('-')[0];
              if (beforeHyphen && !isNaN(Number(beforeHyphen))) {
                propId = Number(beforeHyphen);
              }
            }

            if (propId) {
              const syncedProp =
                await this.proposicoesService.ensureProposicaoExists(propId);
              if (syncedProp) {
                proposicoesCount++;
              }
            }
          } catch (err: any) {
            this.logger.error(
              `Failed to ensure proposition for voting ${v.idCamara}: ${err.message}`,
            );
          }
        }),
      );
    }

    this.logger.log(
      `Full synchronization completed. Processed ${votacoes.length} votacoes. Votos: ${votosCount}, Orientacoes: ${orientacoesCount}, Proposicoes: ${proposicoesCount}.`,
    );

    return {
      totalVotacoes: votacoes.length,
      votosSynced: votosCount,
      orientacoesSynced: orientacoesCount,
      proposicoesSynced: proposicoesCount,
    };
  }

  async syncVotosAllVotacoesToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting batch sync of votes for all local votacoes...');
    const votacoes = await this.votacaoRepository.findAll();
    let count = 0;
    const chunkSize = 6;
    for (let i = 0; i < votacoes.length; i += chunkSize) {
      const chunk = votacoes.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (v) => {
          try {
            await this.getAndSyncVotos(v.idCamara, {});
            count++;
          } catch (error: any) {
            this.logger.error(
              `Error syncing votes for voting ${v.idCamara}: ${error.message}`,
            );
          }
        }),
      );
    }
    this.logger.log(`Batch sync of votes completed. Synced ${count} votacoes.`);
    return { synced: count };
  }

  async syncOrientacoesAllVotacoesToDb(): Promise<{ synced: number }> {
    this.logger.log(
      'Starting batch sync of orientations for all local votacoes...',
    );
    const votacoes = await this.votacaoRepository.findAll();
    let count = 0;
    const chunkSize = 6;
    for (let i = 0; i < votacoes.length; i += chunkSize) {
      const chunk = votacoes.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (v) => {
          try {
            await this.getAndSyncOrientacoes(v.idCamara, {});
            count++;
          } catch (error: any) {
            this.logger.error(
              `Error syncing orientations for voting ${v.idCamara}: ${error.message}`,
            );
          }
        }),
      );
    }
    this.logger.log(
      `Batch sync of orientations completed. Synced ${count} votacoes.`,
    );
    return { synced: count };
  }
}
