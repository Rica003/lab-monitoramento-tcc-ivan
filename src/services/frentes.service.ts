import { Injectable, Inject, Logger } from '@nestjs/common';
import { Frente } from '@prisma/client';
import {
  type FrenteRepository,
  FRENTE_REPOSITORY,
} from 'src/repositories/frente/frente.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FrentesResponseDTO } from 'src/dtos/frente/frentes-response.dto';

@Injectable()
export class FrentesService {
  private readonly logger = new Logger(FrentesService.name);

  constructor(
    @Inject(FRENTE_REPOSITORY)
    private readonly frenteRepository: FrenteRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Frente[]> {
    return this.frenteRepository.findAll();
  }

  async findOne(id: number): Promise<Frente | null> {
    return this.frenteRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getFrentes(params?: any): Promise<FrentesResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/frentes',
        { params },
      ),
    );
    return FrentesResponseDTO.fromApiResponse(response.data);
  }

  // --- SYNC ---
  async syncFrentesToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of frentes from Camara API...');
    const response = await this.getFrentes({ itens: 100 });
    let count = 0;
    for (const f of response.frentes) {
      await this.frenteRepository.upsert(f);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} frentes.`);
    return { synced: count };
  }
}
