import { FrenteDTO, FrenteAPIResponse } from './frente.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface FrentesPaginatedAPIResponse {
  dados: FrenteAPIResponse[];
  links: LinkAPIResponse[];
}

export class FrentesResponseDTO {
  frentes: FrenteDTO[];
  links: LinkAPIResponse[];

  constructor(data: FrentesPaginatedAPIResponse) {
    this.frentes = (data.dados || []).map((payload) =>
      FrenteDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: FrentesPaginatedAPIResponse,
  ): FrentesResponseDTO {
    return new FrentesResponseDTO(payload);
  }
}
