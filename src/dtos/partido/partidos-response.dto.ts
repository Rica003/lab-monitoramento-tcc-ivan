import { PartidoDTO, PartidoAPIResponse } from './partido.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface PartidosPaginatedAPIResponse {
  dados: PartidoAPIResponse[];
  links: LinkAPIResponse[];
}

export class PartidosResponseDTO {
  partidos: PartidoDTO[];
  links: LinkAPIResponse[];

  constructor(data: PartidosPaginatedAPIResponse) {
    this.partidos = (data.dados || []).map((payload) =>
      PartidoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: PartidosPaginatedAPIResponse,
  ): PartidosResponseDTO {
    return new PartidosResponseDTO(payload);
  }
}
