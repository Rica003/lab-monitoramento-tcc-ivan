import { VotoIndividual } from '@prisma/client';

export const VOTO_INDIVIDUAL_REPOSITORY = 'VOTO_INDIVIDUAL_REPOSITORY';

export interface VotoIndividualRepository {
  findByVotingId(idCamaraVotacao: string): Promise<VotoIndividual[]>;
  deleteManyByVotingId(idCamaraVotacao: string): Promise<void>;
  createMany(votos: any[]): Promise<void>;
}
