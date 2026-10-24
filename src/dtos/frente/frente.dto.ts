export interface FrenteAPIResponse {
  id: number;
  uri: string;
  titulo: string;
  idLegislatura?: number;
}

export class FrenteDTO {
  id: number;
  uri: string;
  titulo: string;
  idLegislatura?: number;

  constructor(data: FrenteAPIResponse) {
    this.id = Number(data.id);
    this.uri = data.uri;
    this.titulo = data.titulo;
    if (data.idLegislatura) this.idLegislatura = Number(data.idLegislatura);
  }

  static fromApiResponse(payload: FrenteAPIResponse): FrenteDTO {
    return new FrenteDTO(payload);
  }
}
