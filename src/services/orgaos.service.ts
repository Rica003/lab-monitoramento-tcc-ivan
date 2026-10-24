import { Injectable, Inject, Logger } from '@nestjs/common';
import { Orgao } from '@prisma/client';
import {
  type OrgaoRepository,
  ORGAO_REPOSITORY,
} from 'src/repositories/orgao/orgao.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrgaosResponseDTO } from 'src/dtos/orgao/orgaos-response.dto';

@Injectable()
export class OrgaosService {
  private readonly logger = new Logger(OrgaosService.name);

  constructor(
    @Inject(ORGAO_REPOSITORY) private readonly orgaoRepository: OrgaoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Orgao[]> {
    return this.orgaoRepository.findAll();
  }

  async findOne(id: number): Promise<Orgao | null> {
    return this.orgaoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getOrgaos(params?: any): Promise<OrgaosResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get('https://dadosabertos.camara.leg.br/api/v2/orgaos', {
        params,
      }),
    );
    return OrgaosResponseDTO.fromApiResponse(response.data);
  }

  async getOrgaoDetalhes(
    id: number,
    recurso: string,
    params?: any,
  ): Promise<any> {
    const allowed = ['eventos', 'membros', 'votacoes'];
    if (!allowed.includes(recurso))
      throw new Error(`Recurso '${recurso}' não suportado para Orgaos.`);
    const response = await firstValueFrom(
      this.httpService.get(
        `https://dadosabertos.camara.leg.br/api/v2/orgaos/${id}/${recurso}`,
        { params },
      ),
    );
    return response.data;
  }

  // --- SYNC ---
  async syncOrgaosToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of orgaos from Camara API...');
    const response = await this.getOrgaos({ itens: 100 });
    const orgaos = response.orgaos;
    let count = 0;
    for (const o of orgaos) {
      await this.orgaoRepository.upsert(o);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} orgaos.`);
    return { synced: count };
  }
}
