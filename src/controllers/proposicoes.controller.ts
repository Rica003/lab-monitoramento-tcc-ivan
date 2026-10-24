import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProposicoesService } from '../services/proposicoes.service';
import { Proposicao } from '@prisma/client';

@Controller('proposicoes')
export class ProposicoesController {
  constructor(private readonly proposicoesService: ProposicoesService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetProposicoes(@Query() query: any) {
    return this.proposicoesService.getProposicoes(query);
  }

  @Get('camara/:id/:recurso')
  async proxyGetProposicaoDetalhes(
    @Param('id') id: string,
    @Param('recurso') recurso: string,
    @Query() query: any,
  ) {
    return this.proposicoesService.getProposicaoDetalhes(
      Number(id),
      recurso,
      query,
    );
  }

  @Post('sync')
  async syncProposicoes() {
    return this.proposicoesService.syncProposicoesToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Proposicao[]> {
    return this.proposicoesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Proposicao | null> {
    return this.proposicoesService.findOne(Number(id));
  }
}
