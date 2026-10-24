import { Injectable, Inject, Logger } from '@nestjs/common';
import { Legislatura } from '@prisma/client';
import {
  type LegislaturaRepository,
  LEGISLATURA_REPOSITORY,
} from 'src/repositories/legislatura/legislatura.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LegislaturasResponseDTO } from 'src/dtos/legislatura/legislaturas-response.dto';

@Injectable()
export class LegislaturasService {
  private readonly logger = new Logger(LegislaturasService.name);

  constructor(
    @Inject(LEGISLATURA_REPOSITORY)
    private readonly legislaturaRepository: LegislaturaRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Legislatura[]> {
    return this.legislaturaRepository.findAll();
  }

  async findOne(id: number): Promise<Legislatura | null> {
    return this.legislaturaRepository.findByCamaraId(id);
  }

  async getCurrentLegislatura(): Promise<Legislatura | null> {
    let current = await this.legislaturaRepository.findCurrentLegislatura();
    if (!current) {
      this.logger.log(
        'No legislaturas found in local DB. Syncing from Camara API...',
      );
      await this.syncLegislaturasToDb();
      current = await this.legislaturaRepository.findCurrentLegislatura();
    }
    return current;
  }

  // --- PROXY API CÂMARA ---
  async getLegislaturas(params?: any): Promise<LegislaturasResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/legislaturas',
        { params },
      ),
    );
    return LegislaturasResponseDTO.fromApiResponse(response.data);
  }

  // --- SYNC ---
  async syncLegislaturasToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of legislaturas from Camara API...');
    const response = await this.getLegislaturas({
      itens: 100,
      ordem: 'DESC',
      ordenarPor: 'id',
    });
    const legs = response.legislaturas;

    this.logger.log(
      `Fetched ${legs.length} legislaturas. Upserting into DB...`,
    );

    let count = 0;
    for (const l of legs) {
      await this.legislaturaRepository.upsert(l);
      count++;
    }
    this.logger.log(
      `Sync completed. Successfully upserted ${count} legislaturas.`,
    );
    return { synced: count };
  }
}
