import { Votacao } from '@prisma/client';

export const VOTACAO_REPOSITORY = 'VOTACAO_REPOSITORY';

export interface VotacaoRepository {
  findAll(): Promise<Votacao[]>;
  findByCamaraId(idCamara: string): Promise<Votacao>;
  upsert(v: any): Promise<void>;
}
