export interface EventoAPIResponse {
  id: number;
  uri: string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  situacao?: string;
  descricaoTipo?: string;
  descricao?: string;
  localExterno?: string;
  localCamara?: any;
}

export class EventoDTO {
  id: number;
  uri: string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  situacao?: string;
  descricaoTipo?: string;
  descricao?: string;
  localExterno?: string;
  localCamara?: any;

  constructor(data: EventoAPIResponse) {
    this.id = Number(data.id);
    this.uri = data.uri;
    if (data.dataHoraInicio) this.dataHoraInicio = data.dataHoraInicio;
    if (data.dataHoraFim) this.dataHoraFim = data.dataHoraFim;
    if (data.situacao) this.situacao = data.situacao;
    if (data.descricaoTipo) this.descricaoTipo = data.descricaoTipo;
    if (data.descricao) this.descricao = data.descricao;
    if (data.localExterno) this.localExterno = data.localExterno;
    if (data.localCamara) this.localCamara = data.localCamara;
  }

  static fromApiResponse(payload: EventoAPIResponse): EventoDTO {
    return new EventoDTO(payload);
  }
}
