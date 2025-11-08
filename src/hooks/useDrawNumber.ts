import { useState } from "react";
import api from "../services/api";
import ObjectUtils from "../utils/ObjectUtils"; // Assumindo que ObjectUtils está disponível

import toast from "react-hot-toast";

// Interface para um único número da sorte
interface DrawNumber {
  id: number;
  number: number;
  active: boolean;
  winnerAt: string | null;
  emailSendedAt: string | null;
  invoiceId: number;
  createdAt: string;
  updatedAt: string;
  // Campos vindos dos JOINs na API (invoiceRoutes.js)
  fiscalCode?: string; // Código fiscal da fatura associada
  clientName?: string; // Nome do cliente associado à fatura
}

// Resposta de listagem com paginação
interface PaginatedDrawNumberResponse {
  data: DrawNumber[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message: string;
}

// Estrutura para parâmetros de consulta ao buscar números da sorte
interface FetchDrawNumbersParams {
  page?: number;
  limit?: number;
  invoiceId?: string; // Filtro por ID da fatura
  number?: string; // Filtro por número da sorte
  // Outros filtros que possam ser adicionados no backend se necessário
}

// Estrutura para parâmetros de exportação
interface ExportDrawNumbersParams {
  invoiceId?: string;
  number?: string;
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  format?: "csv" | "xlsx" | "pdf";
}

// Estrutura de retorno do hook
interface UseDrawNumber {
  drawNumbers: DrawNumber[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchDrawNumbers: (params?: FetchDrawNumbersParams) => Promise<void>;
  createDrawNumber: (
    drawNumberData: Partial<DrawNumber>
  ) => Promise<DrawNumber | null>;
  getDrawNumber: (id: number) => Promise<DrawNumber | null>;
  updateDrawNumber: (
    id: number,
    drawNumberData: Partial<DrawNumber>
  ) => Promise<DrawNumber | null>;
  deleteDrawNumber: (id: number) => Promise<boolean>;
  exportDrawNumbers: (params?: ExportDrawNumbersParams) => Promise<boolean>;
  sendMegaWinnerEmail: (id: number) => Promise<boolean>;
}

export default function useDrawNumber(): UseDrawNumber {
  const [drawNumbers, setDrawNumbers] = useState<DrawNumber[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca todos os números da sorte com parâmetros de consulta opcionais
  const fetchDrawNumbers = async (
    params?: FetchDrawNumbersParams
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams: { [key: string]: any } = {
        invoiceId: params?.invoiceId,
        number: params?.number,
      };

      ObjectUtils.removeParamsNuable(searchParams); // Remove parâmetros nulos/vazios

      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        search: JSON.stringify(searchParams),
      };

      const response = await api.get<PaginatedDrawNumberResponse>(
        "/draw-numbers",
        {
          params: apiParams,
        }
      );

      setDrawNumbers(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch draw numbers:", err);
      const errorMessage =
        "Falha ao buscar números da sorte. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cria um novo número da sorte
  const createDrawNumber = async (
    drawNumberData: Partial<DrawNumber>
  ): Promise<DrawNumber | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<DrawNumber>(
        "/draw-numbers",
        drawNumberData
      );
      toast.success("Número da sorte criado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to create draw number:", err);
      const errorMessage =
        "Falha ao criar número da sorte. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Busca um único número da sorte por ID
  const getDrawNumber = async (id: number): Promise<DrawNumber | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<DrawNumber>(`/draw-numbers/${id}`);
      return response.data;
    } catch (err: any) {
      console.error("Failed to fetch draw number:", err);
      const errorMessage =
        "Falha ao buscar número da sorte. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza as informações de um número da sorte por ID
  const updateDrawNumber = async (
    id: number,
    drawNumberData: Partial<DrawNumber>
  ): Promise<DrawNumber | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put<DrawNumber>(
        `/draw-numbers/${id}`,
        drawNumberData
      );
      toast.success("Número da sorte atualizado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to update draw number:", err);
      const errorMessage =
        "Falha ao atualizar número da sorte. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Exclui um número da sorte por ID
  const deleteDrawNumber = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/draw-numbers/${id}`);
      toast.success("Número da sorte excluído com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Failed to delete draw number:", err);
      const errorMessage =
        "Falha ao excluir número da sorte. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar números da sorte
  const exportDrawNumbers = async (
    params?: ExportDrawNumbersParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let searchParams = {
        invoiceId: params?.invoiceId,
        number: params?.number,
      };
      ObjectUtils.removeParamsNuable(searchParams);

      const apiParams: { [key: string]: any } = {
        search: JSON.stringify(searchParams),
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão CSV
      };
      ObjectUtils.removeParamsNuable(apiParams);

      const response = await api.get("/draw-numbers/export", {
        params: apiParams,
        responseType: "blob", // Importante para download de arquivos
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Extrai o nome do arquivo do header ou cria um padrão
      const contentDisposition = response.headers["content-disposition"];
      let filename = `numeros_sorte_export.${apiParams.format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Cria link temporário para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpa o link temporário
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação realizada com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Failed to export draw numbers:", err);
      const errorMessage = "Falha na exportação. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMegaWinnerEmail = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.get(`/draw-numbers/send-winner-email/${id}`);
      toast.success("E-mail enviado com sucesso!");
      return true;
    } catch (err: any) {
      const errorMessage = err.message;
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    drawNumbers,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchDrawNumbers,
    createDrawNumber,
    getDrawNumber,
    updateDrawNumber,
    deleteDrawNumber,
    exportDrawNumbers,
    sendMegaWinnerEmail,
  };
}
