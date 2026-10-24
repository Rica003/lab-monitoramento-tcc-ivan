import { Controller, Post } from '@nestjs/common';
import { SyncCronService } from '../services/sync-cron.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncCronService: SyncCronService) {}

  @Post('force-all')
  async forceSyncAll() {
    // Inicia a execução em background sem o "await",
    // para que a requisição não fique pendente por muito tempo.
    this.syncCronService.handleDailySync().catch((err) => {
      console.error('Erro durante a sincronização forçada:', err);
    });

    return {
      message: 'Sincronização total iniciada em background.',
      instruction:
        'Acompanhe o andamento através dos logs no console do terminal.',
    };
  }
}
