import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EventosService } from '../services/eventos.service';
import { Evento } from '@prisma/client';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetEventos(@Query() query: any) {
    return this.eventosService.getEventos(query);
  }

  @Get('camara/:id/:recurso')
  async proxyGetEventoDetalhes(
    @Param('id') id: string,
    @Param('recurso') recurso: string,
    @Query() query: any,
  ) {
    return this.eventosService.getEventoDetalhes(Number(id), recurso, query);
  }

  @Post('sync')
  async syncEventos() {
    return this.eventosService.syncEventosToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Evento[]> {
    return this.eventosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Evento | null> {
    return this.eventosService.findOne(Number(id));
  }
}
