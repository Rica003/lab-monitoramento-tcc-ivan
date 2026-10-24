import { Proposicao } from '@prisma/client';

export const PROPOSICAO_REPOSITORY = 'PROPOSICAO_REPOSITORY';

export interface ProposicaoRepository {
  findAll(): Promise<Proposicao[]>;
  findByCamaraId(idCamara: number): Promise<Proposicao>;
  upsert(p: any): Promise<void>;
}
