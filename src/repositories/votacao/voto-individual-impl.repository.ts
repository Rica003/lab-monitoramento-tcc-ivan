import { Injectable } from '@nestjs/common';
import { VotoIndividual } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { VotoIndividualRepository } from './voto-individual.repository';

@Injectable()
export class VotoIndividualImplRepository implements VotoIndividualRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByVotingId(idCamaraVotacao: string): Promise<VotoIndividual[]> {
    return this.prisma.votoIndividual.findMany({
      where: { idCamaraVotacao },
      orderBy: { nomeDeputado: 'asc' },
    });
  }

  async deleteManyByVotingId(idCamaraVotacao: string): Promise<void> {
    await this.prisma.votoIndividual.deleteMany({
      where: { idCamaraVotacao },
    });
  }

  async createMany(votos: any[]): Promise<void> {
    if (votos.length === 0) return;
    await this.prisma.votoIndividual.createMany({
      data: votos,
    });
  }
}
