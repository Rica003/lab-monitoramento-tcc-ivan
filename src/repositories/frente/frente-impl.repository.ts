import { Injectable, NotFoundException } from '@nestjs/common';
import { Frente } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { FrenteRepository } from './frente.repository';

@Injectable()
export class FrenteImplRepository implements FrenteRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Frente[]> {
    return this.prisma.frente.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Frente> {
    const frente = await this.prisma.frente.findUnique({
      where: { idCamara },
    });

    if (!frente) {
      throw new NotFoundException(
        `Frente com idCamara ${idCamara} não encontrada no banco local.`,
      );
    }

    return frente;
  }

  async upsert(f: any): Promise<void> {
    await this.prisma.frente.upsert({
      where: { idCamara: f.id },
      update: { uri: f.uri, titulo: f.titulo, idLegislatura: f.idLegislatura },
      create: {
        idCamara: f.id,
        uri: f.uri,
        titulo: f.titulo,
        idLegislatura: f.idLegislatura,
      },
    });
  }
}
