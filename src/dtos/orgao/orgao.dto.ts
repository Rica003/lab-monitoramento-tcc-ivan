export interface OrgaoAPIResponse {
  id: number;
  uri: string;
  sigla: string;
  nome: string;
  apelido?: string;
  codTipoOrgao?: number;
  tipoOrgao?: string;
  nomePublicacao?: string;
  nomeResumido?: string;
}

export class OrgaoDTO {
  id: number;
  uri: string;
  sigla: string;
  nome: string;
  apelido?: string;
  codTipoOrgao?: number;
  tipoOrgao?: string;
  nomePublicacao?: string;
  nomeResumido?: string;

  constructor(data: OrgaoAPIResponse) {
    this.id = Number(data.id);
    this.uri = data.uri;
    this.sigla = data.sigla;
    this.nome = data.nome;
    if (data.apelido) this.apelido = data.apelido;
    if (data.codTipoOrgao) this.codTipoOrgao = Number(data.codTipoOrgao);
    if (data.tipoOrgao) this.tipoOrgao = data.tipoOrgao;
    if (data.nomePublicacao) this.nomePublicacao = data.nomePublicacao;
    if (data.nomeResumido) this.nomeResumido = data.nomeResumido;
  }

  static fromApiResponse(payload: OrgaoAPIResponse): OrgaoDTO {
    return new OrgaoDTO(payload);
  }
}
