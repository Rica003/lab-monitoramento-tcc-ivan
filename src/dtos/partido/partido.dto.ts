export interface PartidoAPIResponse {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
  status?: any; // Nested details if loaded from /partidos/:id
  numeroEleitoral?: number;
  urlLogo?: string;
  urlWebSite?: string;
  urlFacebook?: string;
}

export class PartidoDTO {
  id: number;
  sigla: string;
  nome: string;
  uri: string;
  status?: any;
  numeroEleitoral?: number;
  urlLogo?: string;
  urlWebSite?: string;
  urlFacebook?: string;

  constructor(data: PartidoAPIResponse) {
    this.id = data.id;
    this.sigla = data.sigla;
    this.nome = data.nome;
    this.uri = data.uri;
    if (data.status) this.status = data.status;
    if (data.numeroEleitoral) this.numeroEleitoral = data.numeroEleitoral;
    if (data.urlLogo) this.urlLogo = data.urlLogo;
    if (data.urlWebSite) this.urlWebSite = data.urlWebSite;
    if (data.urlFacebook) this.urlFacebook = data.urlFacebook;
  }

  static fromApiResponse(payload: PartidoAPIResponse): PartidoDTO {
    return new PartidoDTO(payload);
  }
}
