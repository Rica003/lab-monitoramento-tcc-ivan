import { Injectable, Inject, Logger } from '@nestjs/common';
import { Partido } from '@prisma/client';
import {
  type PartidoRepository,
  PARTIDO_REPOSITORY,
} from 'src/repositories/partido/partido.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PartidosResponseDTO } from 'src/dtos/partido/partidos-response.dto';

@Injectable()
export class PartidosService {
  private readonly logger = new Logger(PartidosService.name);

  constructor(
    @Inject(PARTIDO_REPOSITORY)
    private readonly partidoRepository: PartidoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Partido[]> {
    return this.partidoRepository.findAll();
  }

  async findOne(id: number): Promise<Partido | null> {
    return this.partidoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getPartidos(params?: any): Promise<PartidosResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/partidos',
        { params },
      ),
    );
    return PartidosResponseDTO.fromApiResponse(response.data);
  }

  // --- SYNC ---
  async syncPartidosToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of all partidos from Camara API...');
    const limitParams = { itens: 100 };
    const response = await this.getPartidos(limitParams);
    const partidos = response.partidos;

    this.logger.log(
      `Fetched ${partidos.length} partidos. Upserting into DB...`,
    );

    let count = 0;
    for (const p of partidos) {
      await this.partidoRepository.upsert(p);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} partidos.`);
    return { synced: count };
  }
}
