export interface DiscursoAPIResponse {
  dataHoraInicio: string;
  dataHoraFim: string | null;
  uriEvento: string | null;
  faseEvento: string | null;
  tipoDiscurso: string | null;
  titulo: string | null;
  keywords: string | null;
  sumario: string | null;
  transcricao: string | null;
}

export class DiscursoDTO {
  static fromApiResponse(apiResponse: DiscursoAPIResponse) {
    return {
      dataHoraInicio: apiResponse.dataHoraInicio,
      dataHoraFim: apiResponse.dataHoraFim,
      uriEvento: apiResponse.uriEvento,
      faseEvento: apiResponse.faseEvento,
      tipoDiscurso: apiResponse.tipoDiscurso,
      titulo: apiResponse.titulo,
      keywords: apiResponse.keywords,
      sumario: apiResponse.sumario,
      transcricao: apiResponse.transcricao,
    };
  }
}

export interface DiscursosResponseDTO {
  dados: DiscursoAPIResponse[];
}
