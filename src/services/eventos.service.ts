import { Injectable, Inject, Logger } from '@nestjs/common';
import { Evento } from '@prisma/client';
import {
  type EventoRepository,
  EVENTO_REPOSITORY,
} from 'src/repositories/evento/evento.repository';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventosResponseDTO } from 'src/dtos/evento/eventos-response.dto';

@Injectable()
export class EventosService {
  private readonly logger = new Logger(EventosService.name);

  constructor(
    @Inject(EVENTO_REPOSITORY)
    private readonly eventoRepository: EventoRepository,
    private readonly httpService: HttpService,
  ) {}

  // --- BANCO INTERNO ---
  async findAll(): Promise<Evento[]> {
    return this.eventoRepository.findAll();
  }

  async findOne(id: number): Promise<Evento | null> {
    return this.eventoRepository.findByCamaraId(id);
  }

  // --- PROXY API CÂMARA ---
  async getEventos(params?: any): Promise<EventosResponseDTO> {
    const response = await firstValueFrom(
      this.httpService.get(
        'https://dadosabertos.camara.leg.br/api/v2/eventos',
        { params },
      ),
    );
    return EventosResponseDTO.fromApiResponse(response.data);
  }

  async getEventoDetalhes(
    id: number,
    recurso: string,
    params?: any,
  ): Promise<any> {
    const allowed = ['deputados', 'orgaos', 'pauta', 'votacoes'];
    if (!allowed.includes(recurso))
      throw new Error(`Recurso '${recurso}' não suportado para Eventos.`);
    const response = await firstValueFrom(
      this.httpService.get(
        `https://dadosabertos.camara.leg.br/api/v2/eventos/${id}/${recurso}`,
        { params },
      ),
    );
    return response.data;
  }

  // --- SYNC ---
  async syncEventosToDb(): Promise<{ synced: number }> {
    this.logger.log('Starting sync of eventos from Camara API...');
    const response = await this.getEventos({ itens: 100 });
    let count = 0;
    for (const e of response.eventos) {
      await this.eventoRepository.upsert(e);
      count++;
    }
    this.logger.log(`Sync completed. Successfully upserted ${count} eventos.`);
    return { synced: count };
  }
}
