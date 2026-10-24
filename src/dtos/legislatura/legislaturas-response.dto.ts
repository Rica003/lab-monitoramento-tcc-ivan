import { LegislaturaDTO, LegislaturaAPIResponse } from './legislatura.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface LegislaturasPaginatedAPIResponse {
  dados: LegislaturaAPIResponse[];
  links: LinkAPIResponse[];
}

export class LegislaturasResponseDTO {
  legislaturas: LegislaturaDTO[];
  links: LinkAPIResponse[];

  constructor(data: LegislaturasPaginatedAPIResponse) {
    this.legislaturas = (data.dados || []).map((payload) =>
      LegislaturaDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: LegislaturasPaginatedAPIResponse,
  ): LegislaturasResponseDTO {
    return new LegislaturasResponseDTO(payload);
  }
}
