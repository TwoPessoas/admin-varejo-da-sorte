// src/hooks/useVoucher.ts
import { useState } from "react";
import api from "../services/api"; // Certifique-se de que o caminho para o seu serviço 'api' esteja correto.
import ObjectUtils from "../utils/ObjectUtils"; // Certifique-se de que o caminho para o seu 'ObjectUtils' esteja correto.
import toast from "react-hot-toast"; // Para notificações de sucesso/erro.

/**
 * Interface que representa um Voucher no frontend, com os campos em camelCase.
 * Corresponde à estrutura da tabela 'vouchers' no banco de dados.
 */
interface Voucher {
  id: number;
  coupom: string;
  gameOpportunityId: number | null; // Mapeia 'game_opportunity_id'
  drawDate: string | null; // Mapeia 'draw_date' (data do sorteio)
  voucherValue: string | null; // Mapeia 'voucher_value' (valor do voucher)
  emailSendedAt: string | null; // Mapeia 'email_sended_at'
  createdAt: string; // Mapeia 'created_at'
  updatedAt: string; // Mapeia 'updated_at'
  clientName: string;
}

/**
 * Interface para a resposta de listagem paginada de vouchers, similar à de clientes.
 */
interface PaginatedVoucherResponse {
  data: Voucher[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message?: string; // Mensagem opcional da API
}

/**
 * Interface para os parâmetros de query ao buscar vouchers, incluindo filtros.
 * Baseado nos 'searchableFields' da API (coupom, drawDate) e nas opções de paginação/data.
 */
interface FetchVouchersParams {
  page?: number;
  limit?: number;
  // Filtros de busca (baseado nos searchableFields definidos em voucherRoutes.txt)
  coupom?: string;
  drawDate?: string; // Para buscar por data exata ou parte da data do sorteio
  // Filtros de data de criação (habilitado via enableDateFiltering no backend)
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  // Parâmetros de ordenação
  orderBy?: string; // Ex: 'id', 'coupom', 'drawDate'
  orderDirection?: "ASC" | "DESC";
}

/**
 * Interface para os parâmetros de exportação de vouchers.
 */
interface ExportVouchersParams {
  // Filtros de busca
  coupom?: string;
  drawDate?: string;
  // Faixa de datas de criação (opcionais)
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  // Formato de exportação
  format?: "csv" | "xlsx" | "pdf";
}

/**
 * Interface que define a estrutura de retorno do hook useVoucher.
 */
interface UseVoucher {
  vouchers: Voucher[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchVouchers: (params?: FetchVouchersParams) => Promise<void>;
  createVoucher: (voucherData: Partial<Voucher>) => Promise<Voucher | null>;
  getVoucher: (id: number) => Promise<Voucher | null>;
  updateVoucher: (
    id: number,
    voucherData: Partial<Voucher>
  ) => Promise<Voucher | null>;
  deleteVoucher: (id: number) => Promise<boolean>;
  exportVouchers: (params?: ExportVouchersParams) => Promise<boolean>;
  sendVoucherWinnerEmail: (id: number) => Promise<boolean>;
}

/**
 * Hook personalizado para gerenciar operações CRUD e estado de vouchers.
 * Ele encapsula a lógica de interação com a API e o gerenciamento de estado para a entidade Voucher.
 *
 * @returns {UseVoucher} Um objeto contendo o estado dos vouchers, paginação, loading, erro e funções para operações CRUD.
 */
export default function useVoucher(): UseVoucher {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todos os vouchers com base nos parâmetros de query fornecidos.
   * Suporta paginação, filtros de busca por campos específicos e filtro por range de data de criação.
   *
   * @param {FetchVouchersParams} [params] - Parâmetros opcionais para busca, paginação e ordenação.
   */
  const fetchVouchers = async (params?: FetchVouchersParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Constrói os parâmetros de busca para enviar à API, que serão serializados em JSON.
      // A API espera um objeto JSON para o parâmetro 'search'.
      const searchParams: { [key: string]: any } = {
        coupom: params?.coupom,
        drawDate: params?.drawDate, // A API em crudHandlers.txt e queryBuilder.txt trata 'drawDate' como searchable.
      };

      // Remove propriedades nulas/indefinidas para não enviar parâmetros de busca vazios.
      // Isso é crucial para que o `buildQuery` do backend funcione corretamente, ignorando filtros vazios.
      ObjectUtils.removeParamsNuable(searchParams);

      // Constrói os parâmetros finais para a requisição Axios.
      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        // O parâmetro 'search' é um JSON string contendo os filtros específicos.
        search:
          Object.keys(searchParams).length > 0
            ? JSON.stringify(searchParams)
            : undefined,
        startDate: params?.startDate, // Para filtro de created_at
        endDate: params?.endDate, // Para filtro de created_at
        orderBy: params?.orderBy, // Para ordenação
        orderDirection: params?.orderDirection, // Para direção da ordenação
      };

      // Remove propriedades nulas/indefinidas dos parâmetros da API.
      ObjectUtils.removeParamsNuable(apiParams);

      // Faz a requisição GET para a API de vouchers.
      const response = await api.get<PaginatedVoucherResponse>("/vouchers", {
        params: apiParams,
      });

      // Atualiza o estado do hook com os dados recebidos da API.
      setVouchers(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Falha ao buscar vouchers:", err);
      const errorMessage =
        "Falha ao buscar vouchers. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Exibe uma notificação de erro.
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento.
    }
  };

  /**
   * Cria um novo voucher na API.
   *
   * @param {Partial<Voucher>} voucherData - Os dados do voucher a ser criado.
   * @returns {Promise<Voucher | null>} O voucher criado ou null em caso de erro.
   */
  const createVoucher = async (
    voucherData: Partial<Voucher>
  ): Promise<Voucher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Faz a requisição POST para criar um novo voucher.
      const response = await api.post<Voucher>("/vouchers", voucherData);
      toast.success("Voucher criado com sucesso!"); // Notificação de sucesso.
      return response.data; // Retorna o voucher criado.
    } catch (err: any) {
      console.error("Falha ao criar voucher:", err);
      const errorMessage =
        "Falha ao criar voucher. Por favor, verifique os dados e tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro.
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca um voucher específico por ID.
   *
   * @param {number} id - O ID do voucher a ser buscado.
   * @returns {Promise<Voucher | null>} O voucher encontrado ou null se não for encontrado ou ocorrer um erro.
   */
  const getVoucher = async (id: number): Promise<Voucher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Faz a requisição GET para buscar um voucher por ID.
      const response = await api.get<Voucher>(`/vouchers/${id}`);
      return response.data; // Retorna o voucher.
    } catch (err: any) {
      console.error(`Falha ao buscar voucher com ID ${id}:`, err);
      const errorMessage = `Falha ao buscar dados do voucher. ID: ${id}. Por favor, tente novamente.`;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza as informações de um voucher existente.
   *
   * @param {number} id - O ID do voucher a ser atualizado.
   * @param {Partial<Voucher>} voucherData - Os dados atualizados do voucher.
   * @returns {Promise<Voucher | null>} O voucher atualizado ou null em caso de erro.
   */
  const updateVoucher = async (
    id: number,
    voucherData: Partial<Voucher>
  ): Promise<Voucher | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Faz a requisição PUT para atualizar um voucher.
      const response = await api.put<Voucher>(`/vouchers/${id}`, voucherData);
      toast.success("Voucher atualizado com sucesso!"); // Notificação de sucesso.
      return response.data; // Retorna o voucher atualizado.
    } catch (err: any) {
      console.error(`Falha ao atualizar voucher com ID ${id}:`, err);
      const errorMessage =
        "Falha ao atualizar voucher. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro.
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deleta um voucher da API.
   *
   * @param {number} id - O ID do voucher a ser deletado.
   * @returns {Promise<boolean>} True se a exclusão foi bem-sucedida, false caso contrário.
   */
  const deleteVoucher = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Faz a requisição DELETE para remover um voucher.
      await api.delete(`/vouchers/${id}`);
      toast.success("Voucher excluído com sucesso!"); // Notificação de sucesso.
      return true;
    } catch (err: any) {
      console.error(`Falha ao excluir voucher com ID ${id}:`, err);
      const errorMessage =
        "Falha ao excluir voucher. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro.
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporta os vouchers para um arquivo (CSV, XLSX, PDF).
   *
   * @param {ExportVouchersParams} [params] - Parâmetros opcionais para filtrar a exportação.
   * @returns {Promise<boolean>} True se a exportação foi bem-sucedida, false caso contrário.
   */
  const exportVouchers = async (
    params?: ExportVouchersParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Constrói os parâmetros de busca para o endpoint de exportação.
      const searchParams: { [key: string]: any } = {
        coupom: params?.coupom,
        drawDate: params?.drawDate,
      };

      ObjectUtils.removeParamsNuable(searchParams);

      const apiParams: { [key: string]: any } = {
        // O parâmetro 'search' é um JSON string.
        search:
          Object.keys(searchParams).length > 0
            ? JSON.stringify(searchParams)
            : undefined,
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão para CSV se não especificado.
      };

      ObjectUtils.removeParamsNuable(apiParams);

      // Faz a requisição GET para o endpoint de exportação.
      // `responseType: "blob"` é crucial para lidar com o download de arquivos.
      const response = await api.get("/vouchers/export", {
        params: apiParams,
        responseType: "blob",
      });

      // Cria um objeto Blob a partir da resposta da API.
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Tenta extrair o nome do arquivo do cabeçalho 'Content-Disposition'.
      let filename = `vouchers_export.${apiParams.format}`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]); // Decodifica para lidar com caracteres especiais.
        }
      }

      // Cria um link temporário para iniciar o download do arquivo.
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Define o nome do arquivo para download.
      document.body.appendChild(link);
      link.click(); // Simula um clique para iniciar o download.

      // Limpa o link temporário e revoga o URL do objeto Blob.
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação de vouchers realizada com sucesso!"); // Notificação de sucesso.
      return true;
    } catch (err: any) {
      console.error("Falha ao exportar vouchers:", err);
      const errorMessage =
        "Falha na exportação de vouchers. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro.
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVoucherWinnerEmail = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.get(`/vouchers/send-voucher-winner-email/${id}`);
      toast.success("E-mail enviado com sucesso!");
      return true;
    } catch (err: any) {
      const errorMessage = err.response.data.message;
      console.log('[err]', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna as variáveis de estado e as funções do hook.
  return {
    vouchers,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchVouchers,
    createVoucher,
    getVoucher,
    updateVoucher,
    deleteVoucher,
    exportVouchers,
    sendVoucherWinnerEmail
  };
}
