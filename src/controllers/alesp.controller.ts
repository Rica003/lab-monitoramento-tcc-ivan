import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AlespService } from 'src/services/alesp.service';

@Controller('api/alesp')
export class AlespController {
  constructor(private readonly alespService: AlespService) {}

  @Get('deputados')
  async getDeputados() {
    return this.alespService.getDeputadosEstaduais();
  }

  @Get('deputados/:id/despesas')
  async getDespesas(
    @Param('id') idDeputado: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    const filterAno = ano ? Number(ano) : undefined;
    const filterMes = mes ? Number(mes) : undefined;
    return this.alespService.getAndSyncDespesasEstadual(
      Number(idDeputado),
      filterAno,
      filterMes,
    );
  }

  @Post('/api/sync/alesp/force-all')
  async forceSync() {
    this.alespService.syncDeputadosEstaduaisToDb().then(() => {
      this.alespService.syncDespesasEstaduaisAllToDb();
    });
    return { message: 'Sincronização ALESP iniciada em segundo plano.' };
  }
}
