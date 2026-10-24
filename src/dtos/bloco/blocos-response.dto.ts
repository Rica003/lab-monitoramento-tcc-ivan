import { BlocoDTO, BlocoAPIResponse } from './bloco.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface BlocosPaginatedAPIResponse {
  dados: BlocoAPIResponse[];
  links: LinkAPIResponse[];
}

export class BlocosResponseDTO {
  blocos: BlocoDTO[];
  links: LinkAPIResponse[];

  constructor(data: BlocosPaginatedAPIResponse) {
    this.blocos = (data.dados || []).map((payload) =>
      BlocoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: BlocosPaginatedAPIResponse,
  ): BlocosResponseDTO {
    return new BlocosResponseDTO(payload);
  }
}
