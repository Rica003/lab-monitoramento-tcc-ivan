import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DeputadosService } from '../services/deputados.service';
import { Deputado } from '@prisma/client';

@Controller('deputados')
export class DeputadosController {
  constructor(private readonly deputadosService: DeputadosService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetDeputados(@Query() query: any) {
    return this.deputadosService.getDeputados(query);
  }

  @Get('camara/:id')
  async proxyGetDeputadoById(@Param('id') id: string) {
    return this.deputadosService.getDeputadoById(Number(id));
  }

  @Get('camara/:id/:recurso')
  async proxyGetDeputadoDetalhes(
    @Param('id') id: string,
    @Param('recurso') recurso: string,
    @Query() query: any,
  ) {
    return this.deputadosService.getDeputadoDetalhes(
      Number(id),
      recurso,
      query,
    );
  }

  @Post('sync')
  async syncDatabaseWithCamaraAPI() {
    return this.deputadosService.syncDeputadosToDb();
  }

  @Post('sync-discursos')
  async syncDiscursos() {
    return this.deputadosService.syncDiscursosToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Deputado[]> {
    return this.deputadosService.findAll();
  }

  @Get(':id/despesas')
  async getDespesas(@Param('id') id: string, @Query() query: any) {
    return this.deputadosService.getAndSyncDespesas(Number(id), query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Deputado | null> {
    return this.deputadosService.findOne(Number(id));
  }
}
