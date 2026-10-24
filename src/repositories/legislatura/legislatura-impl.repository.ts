import { Injectable, NotFoundException } from '@nestjs/common';
import { Legislatura } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { LegislaturaRepository } from './legislatura.repository';

@Injectable()
export class LegislaturaImplRepository implements LegislaturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Legislatura[]> {
    return this.prisma.legislatura.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Legislatura> {
    const legislatura = await this.prisma.legislatura.findUnique({
      where: { idCamara },
    });

    if (!legislatura) {
      throw new NotFoundException(
        `Legislatura com idCamara ${idCamara} não encontrada no banco local.`,
      );
    }

    return legislatura;
  }

  async findCurrentLegislatura(): Promise<Legislatura | null> {
    return this.prisma.legislatura.findFirst({
      orderBy: { idCamara: 'desc' },
    });
  }

  async upsert(l: any): Promise<void> {
    await this.prisma.legislatura.upsert({
      where: { idCamara: l.id },
      update: {
        uri: l.uri,
        dataInicio: l.dataInicio,
        dataFim: l.dataFim,
      },
      create: {
        idCamara: l.id,
        uri: l.uri,
        dataInicio: l.dataInicio,
        dataFim: l.dataFim,
      },
    });
  }
}
