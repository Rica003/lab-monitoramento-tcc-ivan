export interface VotacaoAPIResponse {
  id: string;
  uri: string;
  data?: string;
  dataHoraRegistro?: string;
  siglaOrgao?: string;
  uriOrgao?: string;
  uriEvento?: string;
  proposicaoObjeto?: string;
  uriProposicaoObjeto?: string;
  descricao?: string;
  aprovacao?: number;
}

export class VotacaoDTO {
  id: string;
  uri: string;
  data?: string;
  dataHoraRegistro?: string;
  siglaOrgao?: string;
  uriOrgao?: string;
  uriEvento?: string;
  proposicaoObjeto?: string;
  uriProposicaoObjeto?: string;
  idProposicaoObjeto?: number;
  descricao?: string;
  aprovacao?: number;

  constructor(data: VotacaoAPIResponse) {
    this.id = data.id;
    this.uri = data.uri;
    if (data.data) this.data = data.data;
    if (data.dataHoraRegistro) this.dataHoraRegistro = data.dataHoraRegistro;
    if (data.siglaOrgao) this.siglaOrgao = data.siglaOrgao;
    if (data.uriOrgao) this.uriOrgao = data.uriOrgao;
    if (data.uriEvento) this.uriEvento = data.uriEvento;
    if (data.proposicaoObjeto) this.proposicaoObjeto = data.proposicaoObjeto;
    if (data.uriProposicaoObjeto) {
      this.uriProposicaoObjeto = data.uriProposicaoObjeto;
      const parts = data.uriProposicaoObjeto.split('/');
      const last = parts[parts.length - 1];
      if (last && !isNaN(Number(last))) {
        this.idProposicaoObjeto = Number(last);
      }
    }
    if (data.descricao) this.descricao = data.descricao;
    if (data.aprovacao !== undefined) this.aprovacao = data.aprovacao;
  }

  static fromApiResponse(payload: VotacaoAPIResponse): VotacaoDTO {
    return new VotacaoDTO(payload);
  }
}
