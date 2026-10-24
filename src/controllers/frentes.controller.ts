import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FrentesService } from '../services/frentes.service';
import { Frente } from '@prisma/client';

@Controller('frentes')
export class FrentesController {
  constructor(private readonly frentesService: FrentesService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetFrentes(@Query() query: any) {
    return this.frentesService.getFrentes(query);
  }

  @Post('sync')
  async syncFrentes() {
    return this.frentesService.syncFrentesToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Frente[]> {
    return this.frentesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Frente | null> {
    return this.frentesService.findOne(Number(id));
  }
}
