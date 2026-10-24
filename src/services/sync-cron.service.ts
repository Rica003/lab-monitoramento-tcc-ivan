import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DeputadosService } from './deputados.service';
import { PartidosService } from './partidos.service';
import { LegislaturasService } from './legislaturas.service';
import { ProposicoesService } from './proposicoes.service';
import { VotacoesService } from './votacoes.service';
import { OrgaosService } from './orgaos.service';
import { BlocosService } from './blocos.service';
import { FrentesService } from './frentes.service';
import { GruposService } from './grupos.service';
import { EventosService } from './eventos.service';
import { AlespService } from './alesp.service';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(
    private readonly deputadosService: DeputadosService,
    private readonly partidosService: PartidosService,
    private readonly legislaturasService: LegislaturasService,
    private readonly proposicoesService: ProposicoesService,
    private readonly votacoesService: VotacoesService,
    private readonly orgaosService: OrgaosService,
    private readonly blocosService: BlocosService,
    private readonly frentesService: FrentesService,
    private readonly gruposService: GruposService,
    private readonly eventosService: EventosService,
    private readonly alespService: AlespService,
  ) {}

  @Cron('0 3 * * *') // Executa todos os dias às 03:00 AM
  async handleDailySync() {
    this.logger.log('Iniciando Job de Sincronização Diária...');

    const syncTasks = [
      {
        name: 'Legislaturas',
        fn: () => this.legislaturasService.syncLegislaturasToDb(),
      },
      { name: 'Partidos', fn: () => this.partidosService.syncPartidosToDb() },
      { name: 'Órgãos', fn: () => this.orgaosService.syncOrgaosToDb() },
      { name: 'Blocos', fn: () => this.blocosService.syncBlocosToDb() },
      { name: 'Frentes', fn: () => this.frentesService.syncFrentesToDb() },
      { name: 'Grupos', fn: () => this.gruposService.syncGruposToDb() },
      {
        name: 'Deputados',
        fn: () => this.deputadosService.syncDeputadosToDb(),
      },
      {
        name: 'Proposições',
        fn: () => this.proposicoesService.syncProposicoesToDb(),
      },
      { name: 'Votações', fn: () => this.votacoesService.syncVotacoesToDb() },
      { name: 'Eventos', fn: () => this.eventosService.syncEventosToDb() },
      {
        name: 'Despesas',
        fn: () =>
          this.deputadosService.syncDespesasAllDeputadosToDb(),
      },
      {
        name: 'Detalhes de Votações (Votos, Orientações, Proposições e Autores)',
        fn: () => this.votacoesService.syncFullVotacoesDetails(),
      },
      {
        name: 'Deputados Estaduais (ALESP)',
        fn: () => this.alespService.syncDeputadosEstaduaisToDb(),
      },
      {
        name: 'Despesas Estaduais (ALESP)',
        fn: () => this.alespService.syncDespesasEstaduaisAllToDb(),
      },
    ];

    for (const task of syncTasks) {
      try {
        this.logger.log(`Sincronizando ${task.name}...`);
        await task.fn();
        this.logger.log(`${task.name} sincronizados com sucesso.`);
      } catch (error: unknown) {
        const errStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Erro ao sincronizar ${task.name}. Progredindo para o próximo...`,
          errStack,
        );
      }
    }

    this.logger.log('Job de Sincronização Diária concluído.');
  }

  @Cron('0 0 22 * * 0') // Todo domingo às 22:00
  async handleWeeklyDiscursosSync() {
    this.logger.log('Iniciando Job de Sincronização Semanal de Discursos...');
    try {
      await this.deputadosService.syncDiscursosToDb();
      this.logger.log(
        'Job de Sincronização Semanal de Discursos concluído com sucesso.',
      );
    } catch (error: unknown) {
      const errStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        'Erro ao executar Job de Sincronização Semanal de Discursos.',
        errStack,
      );
    }
  }
}
