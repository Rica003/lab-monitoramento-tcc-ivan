import { EventoDTO, EventoAPIResponse } from './evento.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface EventosPaginatedAPIResponse {
  dados: EventoAPIResponse[];
  links: LinkAPIResponse[];
}

export class EventosResponseDTO {
  eventos: EventoDTO[];
  links: LinkAPIResponse[];

  constructor(data: EventosPaginatedAPIResponse) {
    this.eventos = (data.dados || []).map((payload) =>
      EventoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: EventosPaginatedAPIResponse,
  ): EventosResponseDTO {
    return new EventosResponseDTO(payload);
  }
}
