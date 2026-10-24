import { Grupo } from '@prisma/client';

export const GRUPO_REPOSITORY = 'GRUPO_REPOSITORY';

export interface GrupoRepository {
  findAll(): Promise<Grupo[]>;
  findByCamaraId(idCamara: number): Promise<Grupo>;
  upsert(g: any): Promise<void>;
}
