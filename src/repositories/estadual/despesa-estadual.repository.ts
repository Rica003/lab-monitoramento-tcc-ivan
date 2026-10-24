import { DespesaEstadual } from '@prisma/client';

export const DESPESA_ESTADUAL_REPOSITORY = 'DESPESA_ESTADUAL_REPOSITORY';

export interface DespesaEstadualRepository {
  findByDeputyAndFilters(
    idDeputado: number,
    ano?: number,
    mes?: number,
  ): Promise<DespesaEstadual[]>;
  deleteManyByDeputyAndYear(idDeputado: number, ano: number): Promise<void>;
  createMany(despesas: any[]): Promise<void>;
}
