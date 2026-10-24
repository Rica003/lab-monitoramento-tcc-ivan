import { Evento } from '@prisma/client';

export const EVENTO_REPOSITORY = 'EVENTO_REPOSITORY';

export interface EventoRepository {
  findAll(): Promise<Evento[]>;
  findByCamaraId(idCamara: number): Promise<Evento>;
  upsert(e: any): Promise<void>;
}
