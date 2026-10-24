import { Injectable, NotFoundException } from '@nestjs/common';
import { Grupo } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GrupoRepository } from './grupo.repository';

@Injectable()
export class GrupoImplRepository implements GrupoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Grupo[]> {
    return this.prisma.grupo.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Grupo> {
    const grupo = await this.prisma.grupo.findUnique({
      where: { idCamara },
    });

    if (!grupo) {
      throw new NotFoundException(
        `Grupo com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return grupo;
  }

  async upsert(g: any): Promise<void> {
    await this.prisma.grupo.upsert({
      where: { idCamara: g.id },
      update: { uri: g.uri, nome: g.nome, idLegislatura: g.idLegislatura },
      create: {
        idCamara: g.id,
        uri: g.uri,
        nome: g.nome,
        idLegislatura: g.idLegislatura,
      },
    });
  }
}
