import { Orgao } from '@prisma/client';

export const ORGAO_REPOSITORY = 'ORGAO_REPOSITORY';

export interface OrgaoRepository {
  findAll(): Promise<Orgao[]>;
  findByCamaraId(idCamara: number): Promise<Orgao>;
  upsert(o: any): Promise<void>;
}
