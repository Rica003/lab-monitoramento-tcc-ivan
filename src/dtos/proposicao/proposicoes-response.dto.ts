import { ProposicaoDTO, ProposicaoAPIResponse } from './proposicao.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface ProposicoesPaginatedAPIResponse {
  dados: ProposicaoAPIResponse[];
  links: LinkAPIResponse[];
}

export class ProposicoesResponseDTO {
  proposicoes: ProposicaoDTO[];
  links: LinkAPIResponse[];

  constructor(data: ProposicoesPaginatedAPIResponse) {
    this.proposicoes = (data.dados || []).map((payload) =>
      ProposicaoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: ProposicoesPaginatedAPIResponse,
  ): ProposicoesResponseDTO {
    return new ProposicoesResponseDTO(payload);
  }
}
