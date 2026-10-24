import { Injectable, NotFoundException } from '@nestjs/common';
import { Proposicao } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ProposicaoRepository } from './proposicao.repository';

@Injectable()
export class ProposicaoImplRepository implements ProposicaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Proposicao[]> {
    return this.prisma.proposicao.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Proposicao> {
    const proposicao = await this.prisma.proposicao.findUnique({
      where: { idCamara },
    });

    if (!proposicao) {
      throw new NotFoundException(
        `Proposição com idCamara ${idCamara} não encontrada no banco local.`,
      );
    }

    return proposicao;
  }

  async upsert(p: any): Promise<void> {
    await this.prisma.proposicao.upsert({
      where: { idCamara: p.id },
      update: {
        uri: p.uri,
        siglaTipo: p.siglaTipo,
        codTipo: p.codTipo,
        numero: p.numero,
        ano: p.ano,
        ementa: p.ementa,
        autores: p.autores || null,
      },
      create: {
        idCamara: p.id,
        uri: p.uri,
        siglaTipo: p.siglaTipo,
        codTipo: p.codTipo,
        numero: p.numero,
        ano: p.ano,
        ementa: p.ementa,
        autores: p.autores || null,
      },
    });
  }
}
