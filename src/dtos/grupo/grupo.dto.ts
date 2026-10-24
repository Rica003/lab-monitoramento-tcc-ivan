export interface GrupoAPIResponse {
  id: number;
  uri: string;
  nome: string;
  idLegislatura?: number;
}

export class GrupoDTO {
  id: number;
  uri: string;
  nome: string;
  idLegislatura?: number;

  constructor(data: GrupoAPIResponse) {
    this.id = Number(data.id);
    this.uri = data.uri;
    this.nome = data.nome;
    if (data.idLegislatura) this.idLegislatura = Number(data.idLegislatura);
  }

  static fromApiResponse(payload: GrupoAPIResponse): GrupoDTO {
    return new GrupoDTO(payload);
  }
}
