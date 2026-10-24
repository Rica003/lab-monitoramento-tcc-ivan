import { DeputadoDTO, DeputadoAPIResponse } from './deputado.dto';

export interface LinkAPIResponse {
  rel: string;
  href: string;
}

export interface DeputadosPaginatedAPIResponse {
  dados: DeputadoAPIResponse[];
  links: LinkAPIResponse[];
}

/**
 * Data Transfer Object para lidar com a resposta paginada da listagem de deputados.
 * Envolve a lista de DeputadoDTO e os links de paginação fornecidos pela API da Câmara.
 */
export class DeputadosResponseDTO {
  deputados: DeputadoDTO[];
  links: LinkAPIResponse[];

  constructor(data: DeputadosPaginatedAPIResponse) {
    // Transforma o array "dados" (original da API) em um array de "DeputadoDTO"
    this.deputados = (data.dados || []).map((deputadoPayload) =>
      DeputadoDTO.fromApiResponse(deputadoPayload),
    );

    // Repassa as informações de links/paginação
    this.links = data.links || [];
  }

  /**
   * Fábrica para criar uma instância a partir do payload JSON da API de listagem
   */
  static fromApiResponse(
    payload: DeputadosPaginatedAPIResponse,
  ): DeputadosResponseDTO {
    return new DeputadosResponseDTO(payload);
  }
}
