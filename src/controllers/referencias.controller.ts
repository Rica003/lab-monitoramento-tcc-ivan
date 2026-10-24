import { Controller, Get, Param, Post } from '@nestjs/common';
import { ReferenciasService } from '../services/referencias.service';
import { Referencia } from '@prisma/client';

@Controller('referencias')
export class ReferenciasController {
  constructor(private readonly referenciasService: ReferenciasService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara/*path')
  async proxyGetReferencia(@Param('0') tipo: string) {
    return this.referenciasService.getReferencia(tipo);
  }

  @Post('camara/*path/sync')
  async syncReferencia(@Param('0') tipo: string) {
    return this.referenciasService.syncReferenciaToDb(tipo);
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Referencia[]> {
    return this.referenciasService.findAll();
  }

  @Get('*path')
  async findOne(@Param('0') tipo: string): Promise<Referencia | null> {
    return this.referenciasService.findOne(tipo);
  }
}
