export interface VotoIndividualAPIResponse {
  deputado_: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto?: string;
    email?: string | null;
  };
  tipoVoto: string;
  dataRegistroVoto: string | null;
}

export class VotoIndividualDTO {
  idCamaraDeputado: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  voto: string;
  dataHoraRegistro: string | null;

  constructor(data: VotoIndividualAPIResponse) {
    this.idCamaraDeputado = data.deputado_?.id;
    this.uri = data.deputado_?.uri;
    this.nome = data.deputado_?.nome;
    this.siglaPartido = data.deputado_?.siglaPartido;
    this.uriPartido = data.deputado_?.uriPartido;
    this.siglaUf = data.deputado_?.siglaUf;
    this.idLegislatura = data.deputado_?.idLegislatura;
    this.voto = data.tipoVoto;
    this.dataHoraRegistro = data.dataRegistroVoto;
  }

  static fromApiResponse(
    payload: VotoIndividualAPIResponse,
  ): VotoIndividualDTO {
    return new VotoIndividualDTO(payload);
  }
}
