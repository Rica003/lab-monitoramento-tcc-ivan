import { Injectable, NotFoundException } from '@nestjs/common';
import { Orgao } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { OrgaoRepository } from './orgao.repository';

@Injectable()
export class OrgaoImplRepository implements OrgaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Orgao[]> {
    return this.prisma.orgao.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Orgao> {
    const orgao = await this.prisma.orgao.findUnique({
      where: { idCamara },
    });

    if (!orgao) {
      throw new NotFoundException(
        `Órgão com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return orgao;
  }

  async upsert(o: any): Promise<void> {
    await this.prisma.orgao.upsert({
      where: { idCamara: o.id },
      update: {
        uri: o.uri,
        sigla: o.sigla,
        nome: o.nome,
        apelido: o.apelido,
        codTipoOrgao: o.codTipoOrgao,
        tipoOrgao: o.tipoOrgao,
        nomePublicacao: o.nomePublicacao,
        nomeResumido: o.nomeResumido,
      },
      create: {
        idCamara: o.id,
        uri: o.uri,
        sigla: o.sigla,
        nome: o.nome,
        apelido: o.apelido,
        codTipoOrgao: o.codTipoOrgao,
        tipoOrgao: o.tipoOrgao,
        nomePublicacao: o.nomePublicacao,
        nomeResumido: o.nomeResumido,
      },
    });
  }
}
