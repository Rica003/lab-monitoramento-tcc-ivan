export interface OrientacaoAPIResponse {
  codPartidoBloco: number | string | null;
  siglaPartidoBloco: string | null;
  uriPartidoBloco: string | null;
  codTipoLideranca: string | null;
  orientacaoVoto: string;
}

export class OrientacaoDTO {
  codOrgao: number | null;
  siglaOrgao: string | null;
  uriOrgao: string | null;
  codPartido: number | null;
  siglaPartido: string | null;
  uriPartido: string | null;
  orientacaoVoto: string;

  constructor(data: OrientacaoAPIResponse) {
    this.codOrgao = null;
    this.siglaOrgao = data.codTipoLideranca;
    this.uriOrgao = null;
    this.codPartido = data.codPartidoBloco !== null && data.codPartidoBloco !== undefined && data.codPartidoBloco !== '' ? Number(data.codPartidoBloco) : null;
    this.siglaPartido = data.siglaPartidoBloco;
    this.uriPartido = data.uriPartidoBloco;
    this.orientacaoVoto = data.orientacaoVoto;
  }

  static fromApiResponse(payload: OrientacaoAPIResponse): OrientacaoDTO {
    return new OrientacaoDTO(payload);
  }
}
