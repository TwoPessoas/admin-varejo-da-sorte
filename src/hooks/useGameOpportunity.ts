import { useState } from "react";
import api from "../services/api"; // Assumindo que 'api' é sua instância do Axios configurada
import ObjectUtils from "../utils/ObjectUtils"; // Assumindo que ObjectUtils contém removeParamsNuable
import toast from "react-hot-toast"; // Para notificações de sucesso/erro

/**
 * Interface que representa uma Oportunidade de Jogo.
 * Baseada na tabela `game_opportunities` e nos dados adicionais dos JOINs da API.
 */
interface GameOpportunity {
  id: number;
  gift: string | null;
  active: boolean;
  usedAt: string | null; // timestamptz
  invoiceId: number | null; // int8
  createdAt: string; // timestamptz
  updatedAt: string; // timestamptz
  // Campos adicionais vindos dos JOINs na API
  fiscalCode?: string | null; // de `invoices`
  clientName?: string | null; // de `clients`
}

/**
 * Estrutura de resposta paginada para a listagem de Oportunidades de Jogo.
 */
interface PaginatedGameOpportunityResponse {
  data: GameOpportunity[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message: string;
}

/**
 * Parâmetros de consulta para buscar Oportunidades de Jogo.
 * Inclui filtros e opções de paginação/ordenação.
 */
interface FetchGameOpportunitiesParams {
  page?: number;
  limit?: number;
  // Campos pesquisáveis definidos em gameOpportunityRoutes.txt
  invoiceId?: string; // Filtrar por ID da fatura (enviado como string para o `search` JSON)
  gift?: string; // Filtrar por presente
  active?: boolean | string; // Filtrar por status ativo/inativo (backend aceita boolean, frontend pode enviar string)
  // Faixa de datas de criação (opcionais), habilitado em queryBuilder e gameOpportunityRoutes
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  // Ordenação
  orderBy?: string; // Campo para ordenação (ex: 'createdAt', 'gift')
  orderDirection?: "ASC" | "DESC"; // Direção da ordenação
}

/**
 * Parâmetros para a funcionalidade de exportação de Oportunidades de Jogo.
 */
interface ExportGameOpportunitiesParams {
  // Filtros para a exportação
  invoiceId?: string;
  gift?: string;
  active?: boolean | string;
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  format: "csv" | "xlsx" | "pdf"; // Formato do arquivo de exportação
}

/**
 * Estrutura de retorno do hook `useGameOpportunity`.
 * Define todas as propriedades e funções expostas pelo hook.
 */
interface UseGameOpportunity {
  gameOpportunities: GameOpportunity[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchGameOpportunities: (
    params?: FetchGameOpportunitiesParams
  ) => Promise<void>;
  createGameOpportunity: (
    gameOpportunityData: Partial<GameOpportunity>
  ) => Promise<GameOpportunity | null>;
  getGameOpportunity: (id: number) => Promise<GameOpportunity | null>;
  updateGameOpportunity: (
    id: number,
    gameOpportunityData: Partial<GameOpportunity>
  ) => Promise<GameOpportunity | null>;
  deleteGameOpportunity: (id: number) => Promise<boolean>;
  exportGameOpportunities: (
    params?: ExportGameOpportunitiesParams
  ) => Promise<boolean>;
}

/**
 * Hook personalizado para gerenciar operações CRUD e listagem de Game Opportunities.
 * Fornece estado, funções para interação com a API e tratamento de erros/loading.
 */
export default function useGameOpportunity(): UseGameOpportunity {
  const [gameOpportunities, setGameOpportunities] = useState<GameOpportunity[]>(
    []
  );
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todas as Oportunidades de Jogo com base em parâmetros de consulta e paginação.
   */
  const fetchGameOpportunities = async (
    params?: FetchGameOpportunitiesParams
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Constrói os parâmetros de busca específicos para o `search` JSON string
      const searchFilters: { [key: string]: any } = {
        invoiceId: params?.invoiceId,
        gift: params?.gift,
        active: params?.active,
      };
      // Remove campos nulos/vazios do objeto de filtros para não enviá-los à API
      ObjectUtils.removeParamsNuable(searchFilters);

      // Constrói os parâmetros gerais da API, incluindo paginação, ordenação e filtros
      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        search: JSON.stringify(searchFilters), // Filtros enviados como JSON string
        startDate: params?.startDate,
        endDate: params?.endDate,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
      };
      // Remove parâmetros nulos/vazios do objeto apiParams antes de enviar
      ObjectUtils.removeParamsNuable(apiParams);

      const response = await api.get<PaginatedGameOpportunityResponse>(
        "/opportunities",
        {
          params: apiParams,
        }
      );

      setGameOpportunities(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Falha ao buscar oportunidades de jogo:", err);
      const errorMessage =
        "Falha ao buscar oportunidades de jogo. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria uma nova Oportunidade de Jogo.
   * @param gameOpportunityData Dados parciais da nova oportunidade.
   * @returns A Oportunidade de Jogo criada ou null em caso de erro.
   */
  const createGameOpportunity = async (
    gameOpportunityData: Partial<GameOpportunity>
  ): Promise<GameOpportunity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<GameOpportunity>(
        "/opportunities",
        gameOpportunityData
      );
      toast.success("Oportunidade de jogo criada com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Falha ao criar oportunidade de jogo:", err);
      const errorMessage =
        "Falha ao criar oportunidade de jogo. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca uma única Oportunidade de Jogo pelo ID.
   * @param id O ID da oportunidade de jogo.
   * @returns A Oportunidade de Jogo encontrada ou null em caso de erro/não encontrada.
   */
  const getGameOpportunity = async (
    id: number
  ): Promise<GameOpportunity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<GameOpportunity>(
        `/opportunities/${id}`
      );
      return response.data;
    } catch (err: any) {
      console.error("Falha ao buscar oportunidade de jogo por ID:", err);
      setError(
        "Falha ao buscar dados da oportunidade de jogo. Por favor, tente novamente."
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza as informações de uma Oportunidade de Jogo existente.
   * @param id O ID da oportunidade de jogo a ser atualizada.
   * @param gameOpportunityData Dados parciais da oportunidade a serem atualizados.
   * @returns A Oportunidade de Jogo atualizada ou null em caso de erro.
   */
  const updateGameOpportunity = async (
    id: number,
    gameOpportunityData: Partial<GameOpportunity>
  ): Promise<GameOpportunity | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put<GameOpportunity>(
        `/opportunities/${id}`,
        gameOpportunityData
      );
      toast.success("Oportunidade de jogo atualizada com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Falha ao atualizar oportunidade de jogo:", err);
      const errorMessage =
        "Falha ao atualizar oportunidade de jogo. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui uma Oportunidade de Jogo pelo ID.
   * @param id O ID da oportunidade de jogo a ser excluída.
   * @returns true se a exclusão foi bem-sucedida, false caso contrário.
   */
  const deleteGameOpportunity = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/opportunities/${id}`);
      toast.success("Oportunidade de jogo excluída com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Falha ao excluir oportunidade de jogo:", err);
      const errorMessage =
        "Falha ao excluir oportunidade de jogo. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporta Oportunidades de Jogo com base em parâmetros de filtro.
   * Gerencia o download do arquivo retornado pela API.
   * @param params Parâmetros de filtro para a exportação.
   * @returns true se a exportação e download foram bem-sucedidos, false caso contrário.
   */
  const exportGameOpportunities = async (
    params?: ExportGameOpportunitiesParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Constrói os parâmetros de busca específicos para o `search` JSON string
      const searchFilters: { [key: string]: any } = {
        invoiceId: params?.invoiceId,
        gift: params?.gift,
        active: params?.active,
      };
      // Remove campos nulos/vazios do objeto de filtros para não enviá-los à API
      ObjectUtils.removeParamsNuable(searchFilters);

      // Constrói os parâmetros gerais da API para a exportação
      const apiParams: { [key: string]: any } = {
        search: JSON.stringify(searchFilters), // Filtros enviados como JSON string
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão CSV, conforme useClient
      };
      // Remove parâmetros nulos/vazios do objeto apiParams antes de enviar
      ObjectUtils.removeParamsNuable(apiParams);

      // Faz a requisição para exportação, esperando um blob como resposta
      const response = await api.get("/opportunities/export", {
        params: apiParams,
        responseType: "blob", // Importante para o download de arquivos
      });

      // Cria um Blob a partir dos dados da resposta
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Tenta extrair o nome do arquivo do cabeçalho Content-Disposition,
      // ou define um nome padrão.
      const contentDisposition = response.headers["content-disposition"];
      let filename = `oportunidades_jogo_export.${apiParams.format}`; // Nome de arquivo padrão

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Cria um link temporário para iniciar o download no navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Define o nome do arquivo para download
      document.body.appendChild(link);
      link.click(); // Simula um clique no link para iniciar o download

      // Limpa o link temporário e revoga a URL do Blob para liberar memória
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(
        "Exportação de oportunidades de jogo realizada com sucesso!"
      );
      return true;
    } catch (err: any) {
      console.error("Falha ao exportar oportunidades de jogo:", err);
      const errorMessage = "Falha na exportação. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna o estado e as funções para serem utilizados pelos componentes React
  return {
    gameOpportunities,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchGameOpportunities,
    createGameOpportunity,
    getGameOpportunity,
    updateGameOpportunity,
    deleteGameOpportunity,
    exportGameOpportunities,
  };
}
