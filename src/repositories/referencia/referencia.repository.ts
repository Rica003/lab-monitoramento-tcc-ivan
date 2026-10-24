import { Referencia } from '@prisma/client';

export const REFERENCIA_REPOSITORY = 'REFERENCIA_REPOSITORY';

export interface ReferenciaRepository {
  findAll(): Promise<Referencia[]>;
  findByTipo(tipo: string): Promise<Referencia>;
  upsert(tipo: string, dados: any): Promise<void>;
}
