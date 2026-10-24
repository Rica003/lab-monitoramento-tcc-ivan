export interface DespesaAPIResponse {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: string | number | null;
  tipoDocumento: string;
  codTipoDocumento: number;
  dataDocumento: string | null;
  numDocumento: string | null;
  valorDocumento: number;
  urlDocumento: string | null;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string | null;
  valorLiquido: number;
  valorGlosa: number;
  numRessarcimento: string | null;
  codLote: number | null;
  parcela: number | null;
}

export class DespesaDTO {
  ano: number;
  mes: number;
  tipoDespesa: string;
  codDocumento: string | null;
  tipoDocumento: string;
  codTipoDocumento: number;
  dataDocumento: string | null;
  numDocumento: string | null;
  valorDocumento: number;
  urlDocumento: string | null;
  nomeFornecedor: string;
  cnpjCpfFornecedor: string | null;
  valorLiquido: number;
  valorGlosa: number;
  numRessarcimento: string | null;
  codLote: number | null;
  parcela: number | null;

  constructor(data: DespesaAPIResponse) {
    this.ano = data.ano;
    this.mes = data.mes;
    this.tipoDespesa = data.tipoDespesa;
    this.codDocumento =
      data.codDocumento !== null && data.codDocumento !== undefined
        ? String(data.codDocumento)
        : null;
    this.tipoDocumento = data.tipoDocumento;
    this.codTipoDocumento = data.codTipoDocumento;
    this.dataDocumento = data.dataDocumento;
    this.numDocumento = data.numDocumento;
    this.valorDocumento = data.valorDocumento;
    this.urlDocumento = data.urlDocumento;
    this.nomeFornecedor = data.nomeFornecedor;
    this.cnpjCpfFornecedor = data.cnpjCpfFornecedor;
    this.valorLiquido = data.valorLiquido;
    this.valorGlosa = data.valorGlosa;
    this.numRessarcimento = data.numRessarcimento;
    this.codLote = data.codLote;
    this.parcela = data.parcela;
  }

  static fromApiResponse(payload: DespesaAPIResponse): DespesaDTO {
    return new DespesaDTO(payload);
  }
}
