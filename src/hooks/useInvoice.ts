import { useState } from "react";
import api from "../services/api"; // Assumindo que este é o seu cliente Axios configurado
import ObjectUtils from "../utils/ObjectUtils"; // Assumindo que esta utilidade existe e é a mesma de useClient.ts
import toast from "react-hot-toast"; // Para notificações de sucesso/erro

/**
 * Interface que representa uma Fatura no frontend.
 * Os nomes dos campos são em camelCase para seguir a convenção JavaScript/TypeScript,
 * mesmo que no banco de dados sejam em snake_case.
 * Inclui campos adicionais que vêm da tabela 'clients' na listagem de faturas.
 */
export interface Invoice {
  id: number;
  fiscalCode: string; // Corresponde a `fiscal_code` no banco de dados
  invoceValue: number; // Corresponde a `invoce_value` no banco de dados (observe o 'o' extra, que replica o erro de digitação do backend)
  hasItem: boolean; // Corresponde a `has_item`
  hasCreditcard: boolean; // Corresponde a `has_creditcard`
  hasPartnerCode: boolean; // Corresponde a `has_partner_code`
  pdv: string | null;
  store: string | null;
  numCoupon: number | null; // Corresponde a `num_cupom`
  cnpj: string | null; // Corresponde a `cnpj` (tratado como string no frontend devido à lógica de `toString()` no backend e possibilidade de zeros à esquerda)
  creditcard: string | null; // Corresponde a `creditcard` (string JSON de bandeiras de cartão)
  clientId: string; // Corresponde a `client_id`
  createdAt: string; // Corresponde a `created_at`
  updatedAt: string; // Corresponde a `updated_at`

  // Campos adicionais retornados pela função `getAllInvoicesWithClientName` do backend
  clientName?: string; // Nome do cliente associado à fatura
  clientCpf?: string; // CPF do cliente
  clientEmail?: string; // Email do cliente
}

/**
 * Interface para a resposta paginada da listagem de faturas.
 * Segue o padrão estabelecido em `PaginatedClientResponse` do `useClient.ts`.
 */
interface PaginatedInvoiceResponse {
  data: Invoice[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message?: string;
}

/**
 * Interfaces para a resposta complexa da criação de uma fatura.
 * A função `createInvoiceWithTransaction` no backend retorna múltiplos objetos
 * relacionados ao jogo de chances e números da sorte.
 */
interface GameOpportunity {
  invoiceId: number; // Corresponde a `invoice_id`
  gift: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DrawNumber {
  invoiceId: number; // Corresponde a `invoice_id`
  number: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceTransactionResponse {
  invoice: Invoice; // A fatura recém-criada
  totalInvoices: number; // Total de faturas do cliente
  totalGameChances: number; // Total de chances de jogo do cliente
  invoiceGameChances: number; // Chances de jogo geradas por esta fatura específica
  drawNumbers: DrawNumber[]; // Números da sorte gerados
  gameOpportunities: GameOpportunity[]; // Oportunidades de jogo geradas
  products?: any[]; // Campo opcional para produtos, conforme backend
}

/**
 * Interface para os parâmetros de busca e filtro na listagem de faturas.
 * Baseada nos `searchableFields` definidos no `invoiceRoutes.txt` e nos parâmetros do `queryBuilder.txt`.
 */
interface FetchInvoicesParams {
  page?: number; // Número da página atual
  limit?: number; // Limite de itens por página
  fiscalCode?: string; // Filtro por código fiscal
  cnpj?: string; // Filtro por CNPJ
  store?: string; // Filtro por loja
  numCoupon?: number; // Filtro por número do cupom
  pdv?: string; // Filtro por PDV
  clientId?: string; // Filtro por ID do cliente
  startDate?: string; // Data inicial para `created_at` (formato YYYY-MM-DD)
  endDate?: string; // Data final para `created_at` (formato YYYY-MM-DD)
  orderBy?: string; // Campo para ordenação (ex: "createdAt", "invoceValue")
  orderDirection?: "ASC" | "DESC"; // Direção da ordenação
}

/**
 * Interface para os parâmetros de exportação de faturas.
 * Similar aos parâmetros de busca, mas com a adição do formato de exportação.
 */
interface ExportInvoicesParams {
  fiscalCode?: string;
  cnpj?: string;
  store?: string;
  numCoupon?: number;
  pdv?: string;
  clientId?: string;
  startDate?: string; // Data inicial para `created_at` (formato YYYY-MM-DD)
  endDate?: string; // Data final para `created_at` (formato YYYY-MM-DD)
  format?: "csv" | "xlsx" | "pdf"; // Formato de exportação, padrão 'csv'
}

/**
 * Estrutura do objeto retornado pelo hook `useInvoice`.
 * Contém o estado e as funções para manipular faturas.
 */
interface UseInvoice {
  invoices: Invoice[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchInvoices: (params?: FetchInvoicesParams) => Promise<void>;
  createInvoice: (
    invoiceData: Partial<Invoice>
  ) => Promise<CreateInvoiceTransactionResponse | null>;
  getInvoice: (id: number) => Promise<Invoice | null>;
  // updateInvoice foi intencionalmente omitido, pois a rota PUT para invoices está comentada no backend (invoiceRoutes.txt)
  deleteInvoice: (id: number) => Promise<boolean>;
  exportInvoices: (params?: ExportInvoicesParams) => Promise<boolean>;
}

/**
 * Hook personalizado para gerenciar operações de CRUD para Faturas.
 * Oferece funções para buscar, criar, visualizar, deletar e exportar faturas,
 * gerenciando estados de carregamento e erro, e exibindo toasts de notificação.
 */
export default function useInvoice(): UseInvoice {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca todas as faturas com suporte a paginação e filtros.
   * Os parâmetros de busca são serializados em JSON e enviados como o parâmetro 'search'.
   * @param params Objeto contendo os parâmetros de paginação e filtro.
   */
  const fetchInvoices = async (params?: FetchInvoicesParams): Promise<void> => {
    setIsLoading(true); // Indica que a operação está em andamento
    setError(null); // Limpa qualquer erro anterior

    try {
      // Prepara os parâmetros de busca que serão stringificados em JSON para o backend
      const searchParams: { [key: string]: any } = {
        fiscalCode: params?.fiscalCode,
        cnpj: params?.cnpj,
        store: params?.store,
        numCoupon: params?.numCoupon,
        pdv: params?.pdv,
        clientId: params?.clientId,
      };
      // Remove parâmetros nulos ou indefinidos dos filtros de busca
      ObjectUtils.removeParamsNuable(searchParams);

      // Prepara os parâmetros gerais da API (paginação, datas, ordenação e os filtros de busca)
      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        search: JSON.stringify(searchParams), // Converte os filtros de busca para string JSON
        startDate: params?.startDate,
        endDate: params?.endDate,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
      };
      // Remove parâmetros nulos ou indefinidos dos parâmetros gerais da API
      ObjectUtils.removeParamsNuable(apiParams);

      // Realiza a requisição GET para a API de faturas
      const response = await api.get<PaginatedInvoiceResponse>("/invoices", {
        params: apiParams, // Envia os parâmetros construídos para a requisição
      });

      // Atualiza os estados com os dados recebidos
      setInvoices(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Falha ao buscar faturas:", err);
      const errorMessage =
        "Falha ao buscar faturas. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Exibe um toast de erro
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  /**
   * Cria uma nova fatura. Esta função lida com a lógica específica da API de faturas,
   * onde o backend espera apenas `fiscalCode` e `clientId` para iniciar o processo complexo
   * de criação de fatura e chances de jogo.
   * @param invoiceData Dados parciais da fatura contendo `fiscalCode` e `clientId`.
   * @returns O objeto de resposta detalhado da transação de criação ou `null` em caso de erro.
   */
  const createInvoice = async (
    invoiceData: Partial<Invoice>
  ): Promise<CreateInvoiceTransactionResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // O endpoint de criação de fatura no backend (`createInvoiceWithTransaction`)
      // espera apenas o `fiscalCode` e `clientId` no corpo da requisição.
      // Os demais dados da fatura (valor, tem item, etc.) são obtidos internamente
      // pelo backend a partir de uma API externa.
      const payload = {
        fiscalCode: invoiceData.fiscalCode,
        clientId: invoiceData.clientId,
      };

      // Realiza a requisição POST para criar a fatura
      const response = await api.post<CreateInvoiceTransactionResponse>(
        "/invoices",
        payload
      );
      toast.success("Fatura criada com sucesso!"); // Exibe toast de sucesso
      return response.data; // Retorna a resposta completa do backend
    } catch (err: any) {
      console.error("Falha ao criar fatura:", err);
      const errorMessage =
        "Falha ao criar fatura. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage); // Exibe toast de erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca uma única fatura pelo seu ID.
   * @param id O ID da fatura a ser buscada.
   * @returns O objeto da fatura ou `null` se não for encontrada ou ocorrer um erro.
   */
  const getInvoice = async (id: number): Promise<Invoice | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Invoice>(`/invoices/${id}`);
      return response.data; // Retorna os dados da fatura
    } catch (err: any) {
      console.error("Falha ao buscar fatura:", err);
      setError("Falha ao buscar dados da fatura. Por favor, tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui uma fatura pelo seu ID.
   * @param id O ID da fatura a ser excluída.
   * @returns `true` se a exclusão for bem-sucedida, `false` caso contrário.
   */
  const deleteInvoice = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Fatura excluída com sucesso!"); // Exibe toast de sucesso
      return true;
    } catch (err: any) {
      console.error("Falha ao excluir fatura:", err);
      const errorMessage =
        "Falha ao excluir fatura. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage); // Exibe toast de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporta faturas com base em filtros, similar à função `exportClients` em `useClient.ts`.
   * @param params Parâmetros de filtro e formato para a exportação.
   * @returns `true` se a exportação for bem-sucedida, `false` caso contrário.
   */
  const exportInvoices = async (
    params?: ExportInvoicesParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepara os parâmetros de busca que serão enviados como 'search'
      let searchParams = {
        fiscalCode: params?.fiscalCode,
        cnpj: params?.cnpj,
        store: params?.store,
        numCoupon: params?.numCoupon,
        pdv: params?.pdv,
        clientId: params?.clientId,
      };
      ObjectUtils.removeParamsNuable(searchParams);

      // Prepara os parâmetros gerais para a requisição de exportação
      const apiParams: { [key: string]: any } = {
        search: JSON.stringify(searchParams),
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão 'csv' se não especificado
      };
      ObjectUtils.removeParamsNuable(apiParams);

      // Realiza a requisição GET para o endpoint de exportação, esperando um blob (arquivo)
      const response = await api.get("/invoices/export", {
        params: apiParams,
        responseType: "blob", // Fundamental para download de arquivos
      });

      // Cria um Blob a partir dos dados da resposta
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Tenta extrair o nome do arquivo do cabeçalho Content-Disposition, senão usa um padrão
      const contentDisposition = response.headers["content-disposition"];
      let filename = `faturas_export.${apiParams.format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Cria um URL temporário para o Blob e um link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Define o nome do arquivo para download
      document.body.appendChild(link);
      link.click(); // Simula o clique para iniciar o download

      // Limpa o link temporário e revoga o URL do Blob
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação de faturas realizada com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Falha ao exportar faturas:", err);
      const errorMessage =
        "Falha na exportação de faturas. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Retorna o estado e as funções do hook
  return {
    invoices,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    getInvoice,
    deleteInvoice,
    exportInvoices,
  };
}
