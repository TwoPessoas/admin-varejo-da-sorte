// Este utilitário ajudará na formatação de datas para inputs HTML e para a API.
class DateTimeConverter {
  /**
   * Converte uma string ISO (do backend) para o formato YYYY-MM-DDTHH:MM
   * para ser usado com input type="datetime-local".
   */
  static toInputDateTime(isoString: string | null | undefined): string {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      // Verifica se a data é válida
      if (isNaN(date.getTime())) return "";
      // Formata para 'YYYY-MM-DDTHH:MM' (ex: "2023-01-15T10:30")
      return date.toISOString().slice(0, 16);
    } catch (e) {
      console.error(
        "Erro ao converter string ISO para formato de input datetime:",
        e
      );
      return "";
    }
  }

  /**
   * Converte uma string do formato YYYY-MM-DDTHH:MM (do input) para string ISO.
   * Retorna null se a string de entrada for vazia ou inválida.
   */
  static toISOString(inputDateTime: string | null | undefined): string | null {
    if (!inputDateTime) return null;
    try {
      // O construtor Date pode parsear 'YYYY-MM-DDTHH:MM'
      const date = new Date(inputDateTime);
      if (isNaN(date.getTime())) return null; // Verifica se a data é válida
      return date.toISOString(); // Converte para string ISO (UTC)
    } catch (e) {
      console.error("Erro ao converter input datetime para string ISO:", e);
      return null;
    }
  }
}
export default DateTimeConverter;
