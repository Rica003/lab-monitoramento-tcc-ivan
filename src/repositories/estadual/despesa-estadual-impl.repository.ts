import { Injectable } from '@nestjs/common';
import { DespesaEstadual } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { DespesaEstadualRepository } from './despesa-estadual.repository';

@Injectable()
export class DespesaEstadualImplRepository implements DespesaEstadualRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDeputyAndFilters(
    idDeputado: number,
    ano?: number,
    mes?: number,
  ): Promise<DespesaEstadual[]> {
    const where: any = { idDeputado };
    if (ano !== undefined) where.ano = ano;
    if (mes !== undefined) where.mes = mes;

    return this.prisma.despesaEstadual.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }, { valor: 'desc' }],
    });
  }

  async deleteManyByDeputyAndYear(idDeputado: number, ano: number): Promise<void> {
    await this.prisma.despesaEstadual.deleteMany({
      where: { idDeputado, ano },
    });
  }

  async createMany(despesas: any[]): Promise<void> {
    if (despesas.length === 0) return;
    await this.prisma.despesaEstadual.createMany({
      data: despesas,
    });
  }
}
