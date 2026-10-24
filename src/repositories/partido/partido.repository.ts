import { Partido } from '@prisma/client';

export const PARTIDO_REPOSITORY = 'PARTIDO_REPOSITORY';

export interface PartidoRepository {
  findAll(): Promise<Partido[]>;
  findByCamaraId(idCamara: number): Promise<Partido>;
  upsert(p: any): Promise<void>;
}
