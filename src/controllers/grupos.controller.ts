import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GruposService } from '../services/grupos.service';
import { Grupo } from '@prisma/client';

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetGrupos(@Query() query: any) {
    return this.gruposService.getGrupos(query);
  }

  @Post('sync')
  async syncGrupos() {
    return this.gruposService.syncGruposToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Grupo[]> {
    return this.gruposService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Grupo | null> {
    return this.gruposService.findOne(Number(id));
  }
}
