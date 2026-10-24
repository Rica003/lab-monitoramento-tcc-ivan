import { Injectable, NotFoundException } from '@nestjs/common';
import { Referencia } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ReferenciaRepository } from './referencia.repository';

@Injectable()
export class ReferenciaImplRepository implements ReferenciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Referencia[]> {
    return this.prisma.referencia.findMany();
  }

  async findByTipo(tipo: string): Promise<Referencia> {
    const referencia = await this.prisma.referencia.findUnique({
      where: { tipo },
    });

    if (!referencia) {
      throw new NotFoundException(
        `Referência do tipo '${tipo}' não encontrada no banco local.`,
      );
    }

    return referencia;
  }

  async upsert(tipo: string, dados: any): Promise<void> {
    await this.prisma.referencia.upsert({
      where: { tipo },
      update: { dados },
      create: { tipo, dados },
    });
  }
}
