import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaService } from './prisma.service';

import { DeputadoModule } from './modules/deputado.module';
import { DeputadosController } from './controllers/deputados.controller';
import { DeputadosService } from './services/deputados.service';
import { DeputadoImplRepository } from './repositories/deputado/deputado-impl.repository';
import { DEPUTADO_REPOSITORY } from './repositories/deputado/deputado.repository';

// Controllers
import { PartidosController } from './controllers/partidos.controller';
import { LegislaturasController } from './controllers/legislaturas.controller';
import { ProposicoesController } from './controllers/proposicoes.controller';
import { VotacoesController } from './controllers/votacoes.controller';
import { OrgaosController } from './controllers/orgaos.controller';
import { BlocosController } from './controllers/blocos.controller';
import { FrentesController } from './controllers/frentes.controller';
import { GruposController } from './controllers/grupos.controller';
import { EventosController } from './controllers/eventos.controller';
import { ReferenciasController } from './controllers/referencias.controller';
import { SyncController } from './controllers/sync.controller';
import { AlespController } from './controllers/alesp.controller';

// Services
import { PartidosService } from './services/partidos.service';
import { LegislaturasService } from './services/legislaturas.service';
import { ProposicoesService } from './services/proposicoes.service';
import { VotacoesService } from './services/votacoes.service';
import { OrgaosService } from './services/orgaos.service';
import { BlocosService } from './services/blocos.service';
import { FrentesService } from './services/frentes.service';
import { GruposService } from './services/grupos.service';
import { EventosService } from './services/eventos.service';
import { ReferenciasService } from './services/referencias.service';
import { SyncCronService } from './services/sync-cron.service';
import { AlespService } from './services/alesp.service';

// Repositories
import { PartidoImplRepository } from './repositories/partido/partido-impl.repository';
import { PARTIDO_REPOSITORY } from './repositories/partido/partido.repository';
import { LegislaturaImplRepository } from './repositories/legislatura/legislatura-impl.repository';
import { LEGISLATURA_REPOSITORY } from './repositories/legislatura/legislatura.repository';
import { ProposicaoImplRepository } from './repositories/proposicao/proposicao-impl.repository';
import { PROPOSICAO_REPOSITORY } from './repositories/proposicao/proposicao.repository';
import { VotacaoImplRepository } from './repositories/votacao/votacao-impl.repository';
import { VOTACAO_REPOSITORY } from './repositories/votacao/votacao.repository';
import { OrgaoImplRepository } from './repositories/orgao/orgao-impl.repository';
import { ORGAO_REPOSITORY } from './repositories/orgao/orgao.repository';
import { BlocoImplRepository } from './repositories/bloco/bloco-impl.repository';
import { BLOCO_REPOSITORY } from './repositories/bloco/bloco.repository';
import { FrenteImplRepository } from './repositories/frente/frente-impl.repository';
import { FRENTE_REPOSITORY } from './repositories/frente/frente.repository';
import { GrupoImplRepository } from './repositories/grupo/grupo-impl.repository';
import { GRUPO_REPOSITORY } from './repositories/grupo/grupo.repository';
import { EventoImplRepository } from './repositories/evento/evento-impl.repository';
import { EVENTO_REPOSITORY } from './repositories/evento/evento.repository';
import { ReferenciaImplRepository } from './repositories/referencia/referencia-impl.repository';
import { REFERENCIA_REPOSITORY } from './repositories/referencia/referencia.repository';
import { DiscursoImplRepository } from './repositories/discurso/discurso-impl.repository';
import { DISCURSO_REPOSITORY } from './repositories/discurso/discurso.repository';
import { DespesaImplRepository } from './repositories/deputado/despesa-impl.repository';
import { DESPESA_REPOSITORY } from './repositories/deputado/despesa.repository';
import { VotoIndividualImplRepository } from './repositories/votacao/voto-individual-impl.repository';
import { VOTO_INDIVIDUAL_REPOSITORY } from './repositories/votacao/voto-individual.repository';
import { OrientacaoImplRepository } from './repositories/votacao/orientacao-impl.repository';
import { ORIENTACAO_REPOSITORY } from './repositories/votacao/orientacao.repository';
import { DeputadoEstadualImplRepository } from './repositories/estadual/deputado-estadual-impl.repository';
import { DEPUTADO_ESTADUAL_REPOSITORY } from './repositories/estadual/deputado-estadual.repository';
import { DespesaEstadualImplRepository } from './repositories/estadual/despesa-estadual-impl.repository';
import { DESPESA_ESTADUAL_REPOSITORY } from './repositories/estadual/despesa-estadual.repository';

@Module({
  imports: [HttpModule, DeputadoModule, ScheduleModule.forRoot()],
  controllers: [
    DeputadosController,
    PartidosController,
    LegislaturasController,
    ProposicoesController,
    VotacoesController,
    OrgaosController,
    BlocosController,
    FrentesController,
    GruposController,
    EventosController,
    ReferenciasController,
    SyncController,
    AlespController,
  ],
  providers: [
    PrismaService,

    DeputadosService,
    PartidosService,
    LegislaturasService,
    ProposicoesService,
    VotacoesService,
    OrgaosService,
    BlocosService,
    FrentesService,
    GruposService,
    EventosService,
    ReferenciasService,
    SyncCronService,
    AlespService,

    DeputadoImplRepository,
    { provide: DEPUTADO_REPOSITORY, useExisting: DeputadoImplRepository },
    PartidoImplRepository,
    { provide: PARTIDO_REPOSITORY, useExisting: PartidoImplRepository },
    LegislaturaImplRepository,
    { provide: LEGISLATURA_REPOSITORY, useExisting: LegislaturaImplRepository },
    ProposicaoImplRepository,
    { provide: PROPOSICAO_REPOSITORY, useExisting: ProposicaoImplRepository },
    VotacaoImplRepository,
    { provide: VOTACAO_REPOSITORY, useExisting: VotacaoImplRepository },
    OrgaoImplRepository,
    { provide: ORGAO_REPOSITORY, useExisting: OrgaoImplRepository },
    BlocoImplRepository,
    { provide: BLOCO_REPOSITORY, useExisting: BlocoImplRepository },
    FrenteImplRepository,
    { provide: FRENTE_REPOSITORY, useExisting: FrenteImplRepository },
    GrupoImplRepository,
    { provide: GRUPO_REPOSITORY, useExisting: GrupoImplRepository },
    EventoImplRepository,
    { provide: EVENTO_REPOSITORY, useExisting: EventoImplRepository },
    ReferenciaImplRepository,
    { provide: REFERENCIA_REPOSITORY, useExisting: ReferenciaImplRepository },
    DiscursoImplRepository,
    { provide: DISCURSO_REPOSITORY, useExisting: DiscursoImplRepository },
    DespesaImplRepository,
    { provide: DESPESA_REPOSITORY, useExisting: DespesaImplRepository },
    VotoIndividualImplRepository,
    {
      provide: VOTO_INDIVIDUAL_REPOSITORY,
      useExisting: VotoIndividualImplRepository,
    },
    OrientacaoImplRepository,
    { provide: ORIENTACAO_REPOSITORY, useExisting: OrientacaoImplRepository },
    DeputadoEstadualImplRepository,
    { provide: DEPUTADO_ESTADUAL_REPOSITORY, useExisting: DeputadoEstadualImplRepository },
    DespesaEstadualImplRepository,
    { provide: DESPESA_ESTADUAL_REPOSITORY, useExisting: DespesaEstadualImplRepository },
  ],
})
export class AppModule {}
