import { Bloco } from '@prisma/client';

export const BLOCO_REPOSITORY = 'BLOCO_REPOSITORY';

export interface BlocoRepository {
  findAll(): Promise<Bloco[]>;
  findByCamaraId(idCamara: number): Promise<Bloco>;
  upsert(b: any): Promise<void>;
}
