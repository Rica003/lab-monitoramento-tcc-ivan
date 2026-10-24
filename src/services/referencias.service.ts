import { Injectable, Inject, Logger } from '@nestjs/common';
import { Referencia } from '@prisma/client';
import {
  type ReferenciaRepository,
  REFERENCIA_REPOSITORY,
} from 'src/repositories/referencia/referencia.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReferenciasService {
  private readonly logger = new Logger(ReferenciasService.name);

  constructor(
    @Inject(REFERENCIA_REPOSITORY)
    private readonly referenciaRepository: ReferenciaRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Referencia[]> {
    return this.referenciaRepository.findAll();
  }

  async findOne(tipo: string): Promise<Referencia | null> {
    return this.referenciaRepository.findByTipo(tipo);
  }

  // --- PROXY API CÂMARA ---
  async getReferencia(tipo: string): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://dadosabertos.camara.leg.br/api/v2/referencias/${tipo}`,
      ),
    );
    return response.data;
  }

  // --- SYNC ---
  async syncReferenciaToDb(tipo: string): Promise<{ synced: boolean }> {
    this.logger.log(`Starting sync of referencia: ${tipo}...`);
    const response = await this.getReferencia(tipo);
    const dados = response.dados || response;

    await this.referenciaRepository.upsert(tipo, dados);

    this.logger.log(`Sync completed for referencia: ${tipo}.`);
    return { synced: true };
  }
}
