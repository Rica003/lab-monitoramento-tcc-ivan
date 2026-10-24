import { Discurso } from '@prisma/client';

export interface DiscursoRepository {
  findAll(): Promise<Discurso[]>;
  findByDeputadoId(idCamaraDeputado: number): Promise<Discurso[]>;
  upsert(idCamaraDeputado: number, data: any): Promise<void>;
}

export const DISCURSO_REPOSITORY = 'DISCURSO_REPOSITORY';
