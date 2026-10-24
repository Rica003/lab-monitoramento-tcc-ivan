import { Injectable, NotFoundException } from '@nestjs/common';
import { Bloco } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { BlocoRepository } from './bloco.repository';

@Injectable()
export class BlocoImplRepository implements BlocoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Bloco[]> {
    return this.prisma.bloco.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Bloco> {
    const bloco = await this.prisma.bloco.findUnique({
      where: { idCamara },
    });

    if (!bloco) {
      throw new NotFoundException(
        `Bloco com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return bloco;
  }

  async upsert(b: any): Promise<void> {
    await this.prisma.bloco.upsert({
      where: { idCamara: b.id },
      update: { uri: b.uri, nome: b.nome, idLegislatura: b.idLegislatura },
      create: {
        idCamara: b.id,
        uri: b.uri,
        nome: b.nome,
        idLegislatura: b.idLegislatura,
      },
    });
  }
}
