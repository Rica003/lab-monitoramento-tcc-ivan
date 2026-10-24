export interface BlocoAPIResponse {
  id: number;
  uri: string;
  nome: string;
  idLegislatura?: number;
}

export class BlocoDTO {
  id: number;
  uri: string;
  nome: string;
  idLegislatura?: number;

  constructor(data: BlocoAPIResponse) {
    this.id = Number(data.id);
    this.uri = data.uri;
    this.nome = data.nome;
    if (data.idLegislatura) this.idLegislatura = Number(data.idLegislatura);
  }

  static fromApiResponse(payload: BlocoAPIResponse): BlocoDTO {
    return new BlocoDTO(payload);
  }
}
