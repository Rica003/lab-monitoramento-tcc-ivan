import { Orientacao } from '@prisma/client';

export const ORIENTACAO_REPOSITORY = 'ORIENTACAO_REPOSITORY';

export interface OrientacaoRepository {
  findByVotingId(idCamaraVotacao: string): Promise<Orientacao[]>;
  deleteManyByVotingId(idCamaraVotacao: string): Promise<void>;
  createMany(orientacoes: any[]): Promise<void>;
}
