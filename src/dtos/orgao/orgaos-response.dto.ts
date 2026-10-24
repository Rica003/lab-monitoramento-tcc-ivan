import { OrgaoDTO, OrgaoAPIResponse } from './orgao.dto';
import { LinkAPIResponse } from '../deputado/deputados-response.dto';

export interface OrgaosPaginatedAPIResponse {
  dados: OrgaoAPIResponse[];
  links: LinkAPIResponse[];
}

export class OrgaosResponseDTO {
  orgaos: OrgaoDTO[];
  links: LinkAPIResponse[];

  constructor(data: OrgaosPaginatedAPIResponse) {
    this.orgaos = (data.dados || []).map((payload) =>
      OrgaoDTO.fromApiResponse(payload),
    );
    this.links = data.links || [];
  }

  static fromApiResponse(
    payload: OrgaosPaginatedAPIResponse,
  ): OrgaosResponseDTO {
    return new OrgaosResponseDTO(payload);
  }
}
