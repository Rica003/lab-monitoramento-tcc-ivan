import { Injectable } from '@nestjs/common';
import { Despesa } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { DespesaRepository } from './despesa.repository';

@Injectable()
export class DespesaImplRepository implements DespesaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDeputyIdAndFilters(
    idCamaraDeputado: number,
    ano?: number,
    mes?: number,
  ): Promise<Despesa[]> {
    const where: any = { idCamaraDeputado };
    if (ano !== undefined) where.ano = ano;
    if (mes !== undefined) where.mes = mes;

    return this.prisma.despesa.findMany({
      where,
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }, { dataDocumento: 'desc' }],
    });
  }

  async deleteManyByDeputyAndYear(
    idCamaraDeputado: number,
    ano: number,
  ): Promise<void> {
    await this.prisma.despesa.deleteMany({
      where: {
        idCamaraDeputado,
        ano,
      },
    });
  }

  async createMany(despesas: any[]): Promise<void> {
    if (despesas.length === 0) return;
    await this.prisma.despesa.createMany({
      data: despesas,
    });
  }
}
