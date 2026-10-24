import { Despesa } from '@prisma/client';

export const DESPESA_REPOSITORY = 'DESPESA_REPOSITORY';

export interface DespesaRepository {
  findByDeputyIdAndFilters(
    idCamaraDeputado: number,
    ano?: number,
    mes?: number,
  ): Promise<Despesa[]>;
  deleteManyByDeputyAndYear(
    idCamaraDeputado: number,
    ano: number,
  ): Promise<void>;
  createMany(despesas: any[]): Promise<void>;
}
