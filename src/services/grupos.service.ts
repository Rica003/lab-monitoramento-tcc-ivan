import { Injectable, Inject, Logger } from '@nestjs/common';
import { Grupo } from '@prisma/client';
import {
  type GrupoRepository,
  GRUPO_REPOSITORY,
} from 'src/repositories/grupo/grupo.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GruposResponseDTO } from 'src/dtos/grupo/grupos-response.dto';

@Injectable()
export class GruposService {
  private readonly logger = new Logger(GruposService.name);

  constructor(
    @Inject(GRUPO_REPOSITORY) private readonly grupoRepository: GrupoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Grupo[]> {
    return this.grupoRepository.findAll();
  }

  async findOne(id: number): Promise<Grupo | null> {
    return this.grupoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getGrupos(params?: any): Promise<GruposResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get('https://dadosabertos.camara.leg.br/api/v2/grupos', {
        params,
      }),
    );
    return GruposResponseDTO.fromApiResponse(response.data);
  }

  // --- SYNC ---
  async syncGruposToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of grupos from Camara API...');
    const response = await this.getGrupos({ itens: 100 });
    let count = 0;
    for (const g of response.grupos) {
      await this.grupoRepository.upsert(g);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} grupos.`);
    return { synced: count };
  }
}
