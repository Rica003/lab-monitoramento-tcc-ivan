import { Frente } from '@prisma/client';

export const FRENTE_REPOSITORY = 'FRENTE_REPOSITORY';

export interface FrenteRepository {
  findAll(): Promise<Frente[]>;
  findByCamaraId(idCamara: number): Promise<Frente>;
  upsert(f: any): Promise<void>;
}
