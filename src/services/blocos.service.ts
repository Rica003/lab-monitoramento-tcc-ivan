import { Injectable, Inject, Logger } from '@nestjs/common';
import { Bloco } from '@prisma/client';
import {
  type BlocoRepository,
  BLOCO_REPOSITORY,
} from 'src/repositories/bloco/bloco.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BlocosResponseDTO } from 'src/dtos/bloco/blocos-response.dto';

@Injectable()
export class BlocosService {
  private readonly logger = new Logger(BlocosService.name);

  constructor(
    @Inject(BLOCO_REPOSITORY) private readonly blocoRepository: BlocoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Bloco[]> {
    return this.blocoRepository.findAll();
  }

  async findOne(id: number): Promise<Bloco | null> {
    return this.blocoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getBlocos(params?: any): Promise<BlocosResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get('https://dadosabertos.camara.leg.br/api/v2/blocos', {
        params,
      }),
    );
    return BlocosResponseDTO.fromApiResponse(response.data);
  }

  // --- SYNC ---
  async syncBlocosToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of blocos from Camara API...');
    const response = await this.getBlocos({ itens: 100 });
    let count = 0;
    for (const b of response.blocos) {
      await this.blocoRepository.upsert(b);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} blocos.`);
    return { synced: count };
  }
}
