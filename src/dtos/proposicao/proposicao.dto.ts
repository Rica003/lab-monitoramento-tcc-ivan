export interface ProposicaoAPIResponse {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
}

export class ProposicaoDTO {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo?: number;
  numero: number;
  ano: number;
  ementa: string;
  autores?: any[];

  constructor(data: ProposicaoAPIResponse) {
    this.id = data.id;
    this.uri = data.uri;
    this.siglaTipo = data.siglaTipo;
    if (data.codTipo) this.codTipo = data.codTipo;
    this.numero = data.numero;
    this.ano = data.ano;
    this.ementa = data.ementa;
  }

  static fromApiResponse(payload: ProposicaoAPIResponse): ProposicaoDTO {
    return new ProposicaoDTO(payload);
  }
}
