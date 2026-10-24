import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrgaosService } from '../services/orgaos.service';
import { Orgao } from '@prisma/client';

@Controller('orgaos')
export class OrgaosController {
  constructor(private readonly orgaosService: OrgaosService) {}

  // --- PROXY API CÂMARA ---
  @Get('camara')
  async proxyGetOrgaos(@Query() query: any) {
    return this.orgaosService.getOrgaos(query);
  }

  @Get('camara/:id/:recurso')
  async proxyGetOrgaoDetalhes(
    @Param('id') id: string,
    @Param('recurso') recurso: string,
    @Query() query: any,
  ) {
    return this.orgaosService.getOrgaoDetalhes(Number(id), recurso, query);
  }

  @Post('sync')
  async syncOrgaos() {
    return this.orgaosService.syncOrgaosToDb();
  }

  // --- BANCO INTERNO ---
  @Get()
  async findAll(): Promise<Orgao[]> {
    return this.orgaosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Orgao | null> {
    return this.orgaosService.findOne(Number(id));
  }
}
