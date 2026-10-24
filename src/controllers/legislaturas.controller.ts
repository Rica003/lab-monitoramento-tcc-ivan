import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LegislaturasService } from '../services/legislaturas.service';
import { Legislatura } from '@prisma/client';

@Controller('legislaturas')
export class LegislaturasController {
  constructor(private readonly legislaturasService: LegislaturasService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetLegislaturas(@Query() query: any) {
    return this.legislaturasService.getLegislaturas(query);
  }

  @Post('sync')
  async syncLegislaturas() {
    return this.legislaturasService.syncLegislaturasToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Legislatura[]> {
    return this.legislaturasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Legislatura | null> {
    return this.legislaturasService.findOne(Number(id));
  }
}
