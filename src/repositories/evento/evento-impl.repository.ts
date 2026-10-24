import { Injectable, NotFoundException } from '@nestjs/common';
import { Evento } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { EventoRepository } from './evento.repository';

@Injectable()
export class EventoImplRepository implements EventoRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Evento[]> {
    return this.prisma.evento.findMany();
  }

  async findByCamaraId(idCamara: number): Promise<Evento> {
    const evento = await this.prisma.evento.findUnique({
      where: { idCamara },
    });

    if (!evento) {
      throw new NotFoundException(
        `Evento com idCamara ${idCamara} não encontrado no banco local.`,
      );
    }

    return evento;
  }

  async upsert(e: any): Promise<void> {
    await this.prisma.evento.upsert({
      where: { idCamara: e.id },
      update: {
        uri: e.uri,
        dataHoraInicio: e.dataHoraInicio,
        dataHoraFim: e.dataHoraFim,
        situacao: e.situacao,
        descricaoTipo: e.descricaoTipo,
        descricao: e.descricao,
        localExterno: e.localExterno,
        localCamara: e.localCamara,
      },
      create: {
        idCamara: e.id,
        uri: e.uri,
        dataHoraInicio: e.dataHoraInicio,
        dataHoraFim: e.dataHoraFim,
        situacao: e.situacao,
        descricaoTipo: e.descricaoTipo,
        descricao: e.descricao,
        localExterno: e.localExterno,
        localCamara: e.localCamara,
      },
    });
  }
}
