export default class DateUtils {
  /**
   * Converte uma data no formato ISO (ex.: "2025-07-25T01:38:15.019Z") 
   * para o formato "pt-BR" (ex.: "25/07/2025 01:38:15").
   * @param isoString Data no formato ISO.
   * @returns Data formatada no estilo pt-BR ou "Data inválida" se o valor não for válido.
   */
  static toDateTimePtBr(isoString: string): string {
    try {
      if (!isoString) return "";
      
      const date = new Date(isoString);

      // Garante que a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }

      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.error('Erro ao converter data:', error);
      return 'Data inválida';
    }
  }
}