import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BlocosService } from '../services/blocos.service';
import { Bloco } from '@prisma/client';

@Controller('blocos')
export class BlocosController {
  constructor(private readonly blocosService: BlocosService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetBlocos(@Query() query: any) {
    return this.blocosService.getBlocos(query);
  }

  @Post('sync')
  async syncBlocos() {
    return this.blocosService.syncBlocosToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Bloco[]> {
    return this.blocosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Bloco | null> {
    return this.blocosService.findOne(Number(id));
  }
}
