import { DeputadoEstadual } from '@prisma/client';

export const DEPUTADO_ESTADUAL_REPOSITORY = 'DEPUTADO_ESTADUAL_REPOSITORY';

export interface DeputadoEstadualRepository {
  findAll(): Promise<DeputadoEstadual[]>;
  findByIdDeputado(idDeputado: number): Promise<DeputadoEstadual | null>;
  deleteAll(): Promise<void>;
  createMany(deputados: any[]): Promise<void>;
}
