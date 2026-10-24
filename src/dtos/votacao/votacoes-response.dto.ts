import { VotacaoDTO, VotacaoAPIResponse } from './votacao.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface VotacoesPaginatedAPIResponse {
  dados: VotacaoAPIResponse[];
  links: LinkAPIResponse[];
}

export class VotacoesResponseDTO {
  votacoes: VotacaoDTO[];
  links: LinkAPIResponse[];

  constructor(data: VotacoesPaginatedAPIResponse) {
    this.votacoes = (data.dados || []).map((payload) =>
      VotacaoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: VotacoesPaginatedAPIResponse,
  ): VotacoesResponseDTO {
    return new VotacoesResponseDTO(payload);
  }
}
