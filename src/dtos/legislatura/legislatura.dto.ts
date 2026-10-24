export interface LegislaturaAPIResponse {
  id: number;
  uri: string;
  dataInicio: string;
  dataFim: string;
}

export class LegislaturaDTO {
  id: number;
  uri: string;
  dataInicio?: Date;
  dataFim?: Date;

  constructor(data: LegislaturaAPIResponse) {
    this.id = data.id;
    this.uri = data.uri;
    this.dataInicio = data.dataInicio ? new Date(data.dataInicio) : undefined;
    this.dataFim = data.dataFim ? new Date(data.dataFim) : undefined;
  }

  static fromApiResponse(payload: LegislaturaAPIResponse): LegislaturaDTO {
    return new LegislaturaDTO(payload);
  }
}
