import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PartidosService } from '../services/partidos.service';
import { Partido } from '@prisma/client';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetPartidos(@Query() query: any) {
    return this.partidosService.getPartidos(query);
  }

  @Post('sync')
  async syncPartidos() {
    return this.partidosService.syncPartidosToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Partido[]> {
    return this.partidosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partido | null> {
    return this.partidosService.findOne(Number(id));
  }
}
