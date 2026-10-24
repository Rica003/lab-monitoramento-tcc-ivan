import { Injectable } from '@nestjs/common';
import { DeputadoEstadual } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { DeputadoEstadualRepository } from './deputado-estadual.repository';

@Injectable()
export class DeputadoEstadualImplRepository implements DeputadoEstadualRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<DeputadoEstadual[]> {
    return this.prisma.deputadoEstadual.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findByIdDeputado(idDeputado: number): Promise<DeputadoEstadual | null> {
    return this.prisma.deputadoEstadual.findUnique({
      where: { idDeputado },
    });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.deputadoEstadual.deleteMany({});
  }

  async createMany(deputados: any[]): Promise<void> {
    if (deputados.length === 0) return;
    await this.prisma.deputadoEstadual.createMany({
      data: deputados,
    });
  }
}
