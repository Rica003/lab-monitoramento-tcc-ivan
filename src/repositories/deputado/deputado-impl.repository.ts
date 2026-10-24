import { Injectable, NotFoundException } from '@nestjs/common';
import { Deputado } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { DeputadoRepository } from './deputado.repository';

@Injectable()
export class DeputadoImplRepository implements DeputadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Deputado[]> {
    return this.prisma.deputado.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findByCamaraId(idCamara: number): Promise<Deputado> {
    const deputado = await this.prisma.deputado.findUnique({
      where: { idCamara },
    });

    if (!deputado) {
      throw new NotFoundException(
        `Deputado com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return deputado;
  }

  async upsert(dep: any): Promise<void> {
    await this.prisma.deputado.upsert({
      where: { idCamara: dep.id },
      update: {
        uri: dep.uri,
        nome: dep.nome,
        siglaPartido: dep.siglaPartido,
        uriPartido: dep.uriPartido,
        siglaUf: dep.siglaUf,
        idLegislatura: dep.idLegislatura,
        urlFoto: dep.urlFoto,
        email: dep.email || null,
        condicaoEleitoral: dep.condicaoEleitoral || null,
        situacao: dep.situacao || null,
        // Rich fields
        nomeCivil: dep.nomeCivil || null,
        cpf: dep.cpf || null,
        sexo: dep.sexo || null,
        urlWebsite: dep.urlWebsite || null,
        redeSocial: dep.redeSocial || [],
        dataNascimento: dep.dataNascimento || null,
        dataFalecimento: dep.dataFalecimento || null,
        ufNascimento: dep.ufNascimento || null,
        municipioNascimento: dep.municipioNascimento || null,
        escolaridade: dep.escolaridade || null,
        ultimoStatus: dep.ultimoStatusRaw || null,
      },
      create: {
        idCamara: dep.id,
        uri: dep.uri,
        nome: dep.nome,
        siglaPartido: dep.siglaPartido,
        uriPartido: dep.uriPartido,
        siglaUf: dep.siglaUf,
        idLegislatura: dep.idLegislatura,
        urlFoto: dep.urlFoto,
        email: dep.email || null,
        condicaoEleitoral: dep.condicaoEleitoral || null,
        situacao: dep.situacao || null,
        // Rich fields
        nomeCivil: dep.nomeCivil || null,
        cpf: dep.cpf || null,
        sexo: dep.sexo || null,
        urlWebsite: dep.urlWebsite || null,
        redeSocial: dep.redeSocial || [],
        dataNascimento: dep.dataNascimento || null,
        dataFalecimento: dep.dataFalecimento || null,
        ufNascimento: dep.ufNascimento || null,
        municipioNascimento: dep.municipioNascimento || null,
        escolaridade: dep.escolaridade || null,
        ultimoStatus: dep.ultimoStatusRaw || null,
      },
    });
  }
}
