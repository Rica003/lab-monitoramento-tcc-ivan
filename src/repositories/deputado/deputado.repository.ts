import { Deputado } from '@prisma/client';

export const DEPUTADO_REPOSITORY = 'DEPUTADO_REPOSITORY';

export interface DeputadoRepository {
  findAll(): Promise<Deputado[]>;
  findByCamaraId(idCamara: number): Promise<Deputado>;
  upsert(dep: any): Promise<void>;
}
