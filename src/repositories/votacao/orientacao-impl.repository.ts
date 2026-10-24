import { Injectable } from '@nestjs/common';
import { Orientacao } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { OrientacaoRepository } from './orientacao.repository';

@Injectable()
export class OrientacaoImplRepository implements OrientacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByVotingId(idCamaraVotacao: string): Promise<Orientacao[]> {
    return this.prisma.orientacao.findMany({
      where: { idCamaraVotacao },
      orderBy: [{ siglaPartido: 'asc' }, { siglaOrgao: 'asc' }],
    });
  }

  async deleteManyByVotingId(idCamaraVotacao: string): Promise<void> {
    await this.prisma.orientacao.deleteMany({
      where: { idCamaraVotacao },
    });
  }

  async createMany(orientacoes: any[]): Promise<void> {
    if (orientacoes.length === 0) return;
    await this.prisma.orientacao.createMany({
      data: orientacoes,
    });
  }
}
