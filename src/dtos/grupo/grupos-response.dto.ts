import { GrupoDTO, GrupoAPIResponse } from './grupo.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface GruposPaginatedAPIResponse {
  dados: GrupoAPIResponse[];
  links: LinkAPIResponse[];
}

export class GruposResponseDTO {
  grupos: GrupoDTO[];
  links: LinkAPIResponse[];

  constructor(data: GruposPaginatedAPIResponse) {
    this.grupos = (data.dados || []).map((payload) =>
      GrupoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: GruposPaginatedAPIResponse,
  ): GruposResponseDTO {
    return new GruposResponseDTO(payload);
  }
}
