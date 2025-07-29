// src/hooks/usePageContent.ts
import { useState } from "react";
import api from "../services/api"; // Certifique-se de que seu arquivo api.ts está configurado para o axios
import ObjectUtils from "../utils/ObjectUtils"; // Seu utilitário para remover parâmetros nulos/indefinidos
import toast from "react-hot-toast"; // Para notificações amigáveis ao usuário

/**
 * Interface que representa uma entidade PageContent no frontend.
 * Os nomes dos campos são em camelCase, conforme a conversão do backend.
 */
interface PageContent {
  id: number;
  title: string;
  slug: string;
  content: string | null; // O campo 'content' pode ser nulo no banco de dados
  createdAt: string; // Formato ISO 8601 (ex: "YYYY-MM-DDTHH:mm:ss.sssZ")
  updatedAt: string; // Formato ISO 8601
}

/**
 * Interface para a resposta paginada de PageContents da API.
 * Reflete a estrutura retornada pelo handler 'getAllPageContentsForAdminList' e 'getAll' genérico.
 */
interface PaginatedPageContentResponse {
  data: PageContent[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message?: string; // Mensagem opcional de sucesso/erro
}

/**
 * Parâmetros de consulta para buscar PageContents.
 * Baseado nos 'searchableFields' de pageContentRoutes.txt (title, slug)
 * e também considerando a habilitação de filtros por data (created_at).
 */
interface FetchPageContentsParams {
  page?: number;
  limit?: number;
  title?: string; // Novo: Filtro por Título
  slug?: string; // Novo: Filtro por Slug
  startDate?: string; // Formato: YYYY-MM-DD (para created_at)
  endDate?: string; // Formato: YYYY-MM-DD (para created_at)
  orderBy?: string; // Campo para ordenação (ex: 'title', 'createdAt')
  orderDirection?: "ASC" | "DESC"; // Direção da ordenação
}

/**
 * Parâmetros de consulta para exportar PageContents.
 * Semelhante aos parâmetros de busca, mas com a opção de formato de exportação.
 */
interface ExportPageContentsParams {
  title?: string;
  slug?: string;
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  format?: "csv" | "xlsx" | "pdf"; // Formato de exportação, com CSV como padrão
}

/**
 * Estrutura de retorno do hook `usePageContent`.
 * Contém o estado e as funções para interagir com a API de PageContent.
 */
interface UsePageContent {
  pageContents: PageContent[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchPageContents: (params?: FetchPageContentsParams) => Promise<void>;
  createPageContent: (
    pageContentData: Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>
  ) => Promise<PageContent | null>;
  getPageContent: (id: number) => Promise<PageContent | null>;
  updatePageContent: (
    id: number,
    pageContentData: Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>
  ) => Promise<PageContent | null>;
  deletePageContent: (id: number) => Promise<boolean>;
  exportPageContents: (params?: ExportPageContentsParams) => Promise<boolean>;
}

/**
 * Hook personalizado para gerenciar operações CRUD de PageContent com a API.
 * Inclui funcionalidade de paginação, filtragem e exportação.
 *
 * @returns {UsePageContent} Um objeto contendo o estado atual (dados, paginação, loading, erro)
 * e as funções para realizar operações CRUD.
 */
export default function usePageContent(): UsePageContent {
  // Estados para armazenar os dados e o status da requisição
  const [pageContents, setPageContents] = useState<PageContent[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todas as PageContents da API, com suporte a parâmetros de consulta
   * para paginação, filtragem e ordenação.
   *
   * @param {FetchPageContentsParams} [params] - Parâmetros opcionais para a requisição.
   */
  const fetchPageContents = async (
    params?: FetchPageContentsParams
  ): Promise<void> => {
    setIsLoading(true); // Inicia o estado de carregamento
    setError(null); // Limpa erros anteriores

    try {
      // Constrói o objeto de parâmetros de busca (filtros específicos da entidade)
      // O 'queryBuilder' no backend espera esses filtros dentro de um objeto 'search' serializado em JSON.
      const searchFilters: { [key: string]: any } = {
        title: params?.title,
        slug: params?.slug,
      };

      // Remove propriedades com valores nulos ou indefinidos de searchFilters para não enviá-las
      // Isso evita que a API processe filtros vazios.
      ObjectUtils.removeParamsNuable(searchFilters);

      // Constrói o objeto de parâmetros para a API, incluindo paginação e o filtro de busca.
      // O 'search' é enviado como uma string JSON.
      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        search: JSON.stringify(searchFilters), // Serializa os filtros de busca para JSON
        startDate: params?.startDate, // Filtro de data de criação
        endDate: params?.endDate, // Filtro de data de criação
        orderBy: params?.orderBy, // Campo para ordenação
        orderDirection: params?.orderDirection, // Direção da ordenação
      };

      // Remove propriedades nulas/indefinidas de apiParams antes de enviar para a API
      ObjectUtils.removeParamsNuable(apiParams);

      // Realiza a requisição GET para a rota de listagem de PageContents
      const response = await api.get<PaginatedPageContentResponse>("/pages-content", {
        params: apiParams,
      });

      // Atualiza o estado com os dados recebidos da API
      setPageContents(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Falha ao buscar conteúdos de página:", err);
      const errorMessage =
        "Falha ao buscar conteúdos de página. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Exibe uma notificação de erro
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  /**
   * Cria um novo PageContent na API.
   *
   * @param {Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>} pageContentData - Os dados da nova página.
   *        Omitimos 'id', 'createdAt' e 'updatedAt' pois são gerados pelo backend.
   *        O 'slug' é opcional e, se não fornecido, será gerado automaticamente pelo backend.
   * @returns {Promise<PageContent | null>} O PageContent criado ou null em caso de erro.
   */
  const createPageContent = async (
    pageContentData: Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>
  ): Promise<PageContent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Realiza a requisição POST para criar um novo PageContent
      const response = await api.post<PageContent>("/pages-content", pageContentData);
      toast.success("Conteúdo de página criado com sucesso!"); // Notificação de sucesso
      return response.data; // Retorna os dados do PageContent criado
    } catch (err: any) {
      console.error("Falha ao criar conteúdo de página:", err);
      const errorMessage =
        "Falha ao criar conteúdo de página. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca um único PageContent pelo seu ID.
   *
   * @param {number} id - O ID do PageContent a ser buscado.
   * @returns {Promise<PageContent | null>} O PageContent encontrado ou null em caso de erro.
   */
  const getPageContent = async (id: number): Promise<PageContent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Realiza a requisição GET para buscar um PageContent específico por ID
      const response = await api.get<PageContent>(`/pages-content/${id}`);
      return response.data; // Retorna os dados do PageContent
    } catch (err: any) {
      console.error("Falha ao buscar conteúdo de página:", err);
      const errorMessage =
        "Falha ao buscar dados do conteúdo de página. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Notificação de erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza um PageContent existente na API.
   *
   * @param {number} id - O ID do PageContent a ser atualizado.
   * @param {Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>} pageContentData - Os dados para atualização.
   * @returns {Promise<PageContent | null>} O PageContent atualizado ou null em caso de erro.
   */
  const updatePageContent = async (
    id: number,
    pageContentData: Partial<Omit<PageContent, "id" | "createdAt" | "updatedAt">>
  ): Promise<PageContent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Realiza a requisição PUT para atualizar um PageContent existente
      const response = await api.put<PageContent>(
        `/pages-content/${id}`,
        pageContentData
      );
      toast.success("Conteúdo de página atualizado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Falha ao atualizar conteúdo de página:", err);
      const errorMessage =
        "Falha ao atualizar conteúdo de página. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui um PageContent da API.
   *
   * @param {number} id - O ID do PageContent a ser excluído.
   * @returns {Promise<boolean>} True se a exclusão for bem-sucedida, false caso contrário.
   */
  const deletePageContent = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Realiza a requisição DELETE para remover um PageContent
      await api.delete(`/pages-content/${id}`);
      toast.success("Conteúdo de página excluído com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Falha ao excluir conteúdo de página:", err);
      const errorMessage =
        "Falha ao excluir conteúdo de página. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporta dados de PageContent com base nos parâmetros de filtro.
   * A função lida com o download do arquivo retornado pela API.
   *
   * @param {ExportPageContentsParams} [params] - Parâmetros opcionais para filtrar a exportação.
   * @returns {Promise<boolean>} True se a exportação for bem-sucedida e o download iniciado, false caso contrário.
   */
  const exportPageContents = async (
    params?: ExportPageContentsParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Constrói os parâmetros de busca para a exportação
      const searchFilters: { [key: string]: any } = {
        title: params?.title,
        slug: params?.slug,
      };
      ObjectUtils.removeParamsNuable(searchFilters); // Limpa filtros vazios

      // Constrói os parâmetros da API para a requisição de exportação
      const apiParams: { [key: string]: any } = {
        search: JSON.stringify(searchFilters),
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão de exportação é CSV
      };
      ObjectUtils.removeParamsNuable(apiParams); // Limpa parâmetros vazios

      // Realiza a requisição GET para a rota de exportação
      // 'responseType: "blob"' é crucial para lidar com o download de arquivos binários
      const response = await api.get("/pages-content/export", {
        params: apiParams,
        responseType: "blob",
      });

      // Cria um Blob a partir dos dados da resposta e determina o tipo do arquivo
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Tenta extrair o nome do arquivo do cabeçalho 'content-disposition' da resposta
      const contentDisposition = response.headers["content-disposition"];
      let filename = `page_contents_export.${apiParams.format}`; // Nome padrão do arquivo

      if (contentDisposition) {
        // Expressão regular para encontrar o nome do arquivo dentro das aspas duplas
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]; // Usa o nome do arquivo do cabeçalho
        }
      }

      // Cria um link temporário na memória para iniciar o download do arquivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Define o nome do arquivo para download
      document.body.appendChild(link); // Anexa o link ao DOM (necessário para .click())
      link.click(); // Simula um clique no link para iniciar o download

      // Limpa o link temporário e revoga a URL do Blob para liberar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação realizada com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Falha na exportação de conteúdos de página:", err);
      const errorMessage = "Falha na exportação. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna todos os estados e funções para serem utilizados nos componentes React
  return {
    pageContents,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchPageContents,
    createPageContent,
    getPageContent,
    updatePageContent,
    deletePageContent,
    exportPageContents,
  };
}