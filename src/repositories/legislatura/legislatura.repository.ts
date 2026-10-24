import { Legislatura } from '@prisma/client';

export const LEGISLATURA_REPOSITORY = 'LEGISLATURA_REPOSITORY';

export interface LegislaturaRepository {
  findAll(): Promise<Legislatura[]>;
  findByCamaraId(idCamara: number): Promise<Legislatura>;
  findCurrentLegislatura(): Promise<Legislatura | null>;
  upsert(l: any): Promise<void>;
}
