import { Injectable, NotFoundException } from '@nestjs/common';
import { Partido } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PartidoRepository } from './partido.repository';

@Injectable()
export class PartidoImplRepository implements PartidoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Partido[]> {
    return this.prisma.partido.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Partido> {
    const partido = await this.prisma.partido.findUnique({
      where: { idCamara },
    });

    if (!partido) {
      throw new NotFoundException(
        `Partido com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return partido;
  }

  async upsert(p: any): Promise<void> {
    await this.prisma.partido.upsert({
      where: { idCamara: p.id },
      update: {
        sigla: p.sigla,
        nome: p.nome,
        uri: p.uri,
        status: p.status,
        numeroEleitoral: p.numeroEleitoral,
        urlLogo: p.urlLogo,
        urlWebSite: p.urlWebSite,
        urlFacebook: p.urlFacebook,
      },
      create: {
        idCamara: p.id,
        sigla: p.sigla,
        nome: p.nome,
        uri: p.uri,
        status: p.status,
        numeroEleitoral: p.numeroEleitoral,
        urlLogo: p.urlLogo,
        urlWebSite: p.urlWebSite,
        urlFacebook: p.urlFacebook,
      },
    });
  }
}
