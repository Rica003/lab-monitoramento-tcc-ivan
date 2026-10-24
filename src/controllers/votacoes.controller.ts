import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { VotacoesService } from '../services/votacoes.service';
import { Votacao } from '@prisma/client';

@Controller('votacoes')
export class VotacoesController {
  constructor(private readonly votacoesService: VotacoesService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetVotacoes(@Query() query: any) {
    return this.votacoesService.getVotacoes(query);
  }

  @Get('camara/:id/:recurso')
  async proxyGetVotacaoDetalhes(
    @Param('id') id: string,
    @Param('recurso') recurso: string,
    @Query() query: any,
  ) {
    return this.votacoesService.getVotacaoDetalhes(id, recurso, query);
  }

  @Post('sync')
  async syncVotacoes(@Query('dataInicio') dataInicio?: string) {
    return this.votacoesService.syncVotacoesToDb(dataInicio);
  }

  @Post('sync-full')
  async syncFullVotacoes() {
    return this.votacoesService.syncFullVotacoesDetails();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Votacao[]> {
    return this.votacoesService.findAll();
  }

  @Get(':id/votos')
  async getVotos(@Param('id') id: string, @Query() query: any) {
    return this.votacoesService.getAndSyncVotos(id, query);
  }

  @Get(':id/orientacoes')
  async getOrientacoes(@Param('id') id: string, @Query() query: any) {
    return this.votacoesService.getAndSyncOrientacoes(id, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Votacao | null> {
    return this.votacoesService.findOne(id);
  }
}
