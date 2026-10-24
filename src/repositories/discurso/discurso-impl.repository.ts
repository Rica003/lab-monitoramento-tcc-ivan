import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Discurso } from '@prisma/client';
import { DiscursoRepository } from './discurso.repository';

@Injectable()
export class DiscursoImplRepository implements DiscursoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Discurso[]> {
    return this.prisma.discurso.findMany();
  }

  async findByDeputadoId(idCamaraDeputado: number): Promise<Discurso[]> {
    return this.prisma.discurso.findMany({
      where: { idCamaraDeputado },
    });
  }

  async upsert(idCamaraDeputado: number, data: any): Promise<void> {
    const getStringValue = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'object') {
        return val.descricao || val.nome || val.sigla || JSON.stringify(val);
      }
      return String(val);
    };

    const slug = `${idCamaraDeputado}_${data.dataHoraInicio}_${data.titulo || 'sem_titulo'}`;

    await this.prisma.discurso.upsert({
      where: { slug },
      update: {
        idCamaraDeputado,
        dataHoraInicio: new Date(data.dataHoraInicio),
        dataHoraFim: data.dataHoraFim ? new Date(data.dataHoraFim) : null,
        uriEvento: data.uriEvento,
        faseEvento: getStringValue(data.faseEvento),
        tipoDiscurso: getStringValue(data.tipoDiscurso),
        titulo: data.titulo,
        keywords: data.keywords,
        sumario: data.sumario,
        transcricao: data.transcricao,
      },
      create: {
        idCamaraDeputado,
        dataHoraInicio: new Date(data.dataHoraInicio),
        dataHoraFim: data.dataHoraFim ? new Date(data.dataHoraFim) : null,
        uriEvento: data.uriEvento,
        faseEvento: getStringValue(data.faseEvento),
        tipoDiscurso: getStringValue(data.tipoDiscurso),
        titulo: data.titulo,
        keywords: data.keywords,
        sumario: data.sumario,
        transcricao: data.transcricao,
        slug,
      },
    });
  }
}
