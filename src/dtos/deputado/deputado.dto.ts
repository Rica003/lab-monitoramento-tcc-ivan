export interface UltimoStatusAPIResponse {
  id?: number;
  uri?: string;
  nome?: string;
  siglaPartido?: string;
  uriPartido?: string | null;
  siglaUf?: string;
  idLegislatura?: number;
  urlFoto?: string;
  email?: string | null;
  data?: string;
  nomeEleitoral?: string;
  gabinete?: {
    nome?: string | null;
    predio?: string | null;
    sala?: string | null;
    andar?: string | null;
    telefone?: string | null;
    email?: string | null;
  };
  situacao?: string;
  condicaoEleitoral?: string;
  descricaoStatus?: string | null;
}

export interface DeputadoAPIResponse {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string | null;
  ultimoStatus?: UltimoStatusAPIResponse;

  // Rich fields from details endpoint
  nomeCivil?: string;
  cpf?: string;
  sexo?: string;
  urlWebsite?: string | null;
  redeSocial?: string[];
  dataNascimento?: string;
  dataFalecimento?: string | null;
  ufNascimento?: string;
  municipioNascimento?: string;
  escolaridade?: string;
}

/**
 * Data Transfer Object para entidade Deputado.
 * Facilita o mapeamento dos dados da API externa para a estrutura interna da aplicação.
 */
export class DeputadoDTO {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string | null;
  condicaoEleitoral?: string;
  situacao?: string;

  // Rich fields
  nomeCivil?: string;
  cpf?: string;
  sexo?: string;
  urlWebsite?: string | null;
  redeSocial?: string[];
  dataNascimento?: string;
  dataFalecimento?: string | null;
  ufNascimento?: string;
  municipioNascimento?: string;
  escolaridade?: string;
  ultimoStatusRaw?: any;

  constructor(data: DeputadoAPIResponse) {
    this.id = data.id;
    this.uri = data.uri;
    this.nome = data.nome || data.ultimoStatus?.nome || '';
    this.siglaPartido =
      data.siglaPartido || data.ultimoStatus?.siglaPartido || '';
    this.uriPartido = data.uriPartido || data.ultimoStatus?.uriPartido || '';
    this.siglaUf = data.siglaUf || data.ultimoStatus?.siglaUf || '';
    this.idLegislatura =
      data.idLegislatura || data.ultimoStatus?.idLegislatura || 0;
    this.urlFoto = data.urlFoto || data.ultimoStatus?.urlFoto || '';
    this.email = data.email || data.ultimoStatus?.email || null;
    this.condicaoEleitoral = data.ultimoStatus?.condicaoEleitoral;
    this.situacao = data.ultimoStatus?.situacao;

    // Detailed fields
    this.nomeCivil = data.nomeCivil;
    this.cpf = data.cpf;
    this.sexo = data.sexo;
    this.urlWebsite = data.urlWebsite;
    this.redeSocial = data.redeSocial || [];
    this.dataNascimento = data.dataNascimento;
    this.dataFalecimento = data.dataFalecimento;
    this.ufNascimento = data.ufNascimento;
    this.municipioNascimento = data.municipioNascimento;
    this.escolaridade = data.escolaridade;
    this.ultimoStatusRaw = data.ultimoStatus;
  }

  /**
   * Fábrica para criar uma instância do DTO a partir do payload original da API.
   */
  static fromApiResponse(payload: DeputadoAPIResponse): DeputadoDTO {
    return new DeputadoDTO(payload);
  }
}
