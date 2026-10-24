import { Injectable, NotFoundException } from '@nestjs/common';
import { Votacao } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { VotacaoRepository } from './votacao.repository';

@Injectable()
export class VotacaoImplRepository implements VotacaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Votacao[]> {
    return this.prisma.votacao.findMany();
  }

  async findByCamaraId(idCamara: string): Promise<Votacao> {
    const votacao = await this.prisma.votacao.findUnique({
      where: { idCamara },
    });

    if (!votacao) {
      throw new NotFoundException(
        `Votação com idCamara ${idCamara} não encontrada no banco local.`,
      );
    }

    return votacao;
  }

  async upsert(v: any): Promise<void> {
    await this.prisma.votacao.upsert({
      where: { idCamara: v.id },
      update: {
        uri: v.uri,
        data: v.data,
        dataHoraRegistro: v.dataHoraRegistro,
        siglaOrgao: v.siglaOrgao,
        uriOrgao: v.uriOrgao,
        uriEvento: v.uriEvento,
        proposicaoObjeto: v.proposicaoObjeto,
        uriProposicaoObjeto: v.uriProposicaoObjeto,
        idProposicaoObjeto: v.idProposicaoObjeto || null,
        descricao: v.descricao,
        aprovacao: v.aprovacao,
      },
      create: {
        idCamara: v.id,
        uri: v.uri,
        data: v.data,
        dataHoraRegistro: v.dataHoraRegistro,
        siglaOrgao: v.siglaOrgao,
        uriOrgao: v.uriOrgao,
        uriEvento: v.uriEvento,
        proposicaoObjeto: v.proposicaoObjeto,
        uriProposicaoObjeto: v.uriProposicaoObjeto,
        idProposicaoObjeto: v.idProposicaoObjeto || null,
        descricao: v.descricao,
        aprovacao: v.aprovacao,
      },
    });
  }
}
