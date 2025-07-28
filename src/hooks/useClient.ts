// src/hooks/useClient.ts
import { useState } from "react";
import api from "../services/api";
import ObjectUtils from "../utils/ObjectUtils";
import toast from "react-hot-toast";

interface Client {
  id: number;
  isPreRegister: boolean;
  name: string;
  cpf: string;
  birthday: string | null;
  cel: string | null;
  email: string | null;
  isMegaWinner: boolean;
  emailSendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// List response with pagination
interface PaginatedClientResponse {
  data: Client[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  message: string;
}

// Structure for query parameters when fetching clients
interface FetchClientsParams {
  page?: number;
  limit?: number;
  id?: string; // Novo: Filtro por ID
  name?: string; // Novo: Filtro por Nome
  cpf?: string; // Novo: Filtro por CPF
  cel?: string; // Novo: Filtro por Celular
}

// Hook return structure
interface UseClient {
  clients: Client[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchClients: (params?: FetchClientsParams) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client | null>;
  getClient: (id: number) => Promise<Client | null>;
  updateClient: (
    id: number,
    clientData: Partial<Client>
  ) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
  exportClients: (params?: ExportClientsParams) => Promise<boolean>;
}

interface ExportClientsParams {
  name?: string;
  cpf?: string;
  cel?: string;
  // Faixa de datas (opcionais)
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  // Formato de exportação (futuro)
  format?: "csv" | "xlsx" | "pdf";
}

export default function useClient(): UseClient {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all clients with optional query parameters
  const fetchClients = async (params?: FetchClientsParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Cria um objeto de parâmetros para enviar à API,
      // incluindo apenas os campos que possuem valor definido.
      const searchParams: { [key: string]: any } = {
        name: params?.name,
        cpf: params?.cpf,
        cel: params?.cel,
      };

      ObjectUtils.removeParamsNuable(searchParams);

      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        search: JSON.stringify(searchParams),
      };

      const response = await api.get<PaginatedClientResponse>("/clients", {
        params: apiParams, // Envia os parâmetros construídos para a requisição
      });

      setClients(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch clients:", err);
      const errorMessage =
        "Falha ao buscar clientes. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new client
  const createClient = async (
    clientData: Partial<Client>
  ): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<Client>("/clients", clientData);
      toast.success("Operação realizada com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to create client:", err);
      const errorMessage =
        "Falha ao criar cliente. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage); // Dispara toast de erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single client by ID
  const getClient = async (id: number): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (err: any) {
      console.error("Failed to fetch client:", err);
      setError("Failed to fetch client data. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a client's information by ID
  const updateClient = async (
    id: number,
    clientData: Partial<Client>
  ): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put<Client>(`/clients/${id}`, clientData);
      toast.success("Cliente atualizado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to update client:", err);
      const errorMessage =
        "Falha ao atualizar cliente. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a client by ID
  const deleteClient = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/clients/${id}`);
      toast.success("Cliente excluído com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Failed to delete client:", err);
      const errorMessage =
        "Falha ao excluir cliente. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //Exportar clientes
  const exportClients = async (
    params?: ExportClientsParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      let searchParams = {
        name: params?.name,
        cpf: params?.cpf,
        cel: params?.cel,
      };
      // Remove propriedades vazias
      ObjectUtils.removeParamsNuable(searchParams);
      // Constrói os parâmetros para a API
      const apiParams: { [key: string]: any } = {
        search: JSON.stringify(searchParams),
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão CSV
      };

      // Remove propriedades vazias
      ObjectUtils.removeParamsNuable(apiParams);

      // Faz a requisição para exportação
      const response = await api.get("/clients/export", {
        params: apiParams,
        responseType: "blob", // Importante para download de arquivos
      });

      // Cria o blob e faz o download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Extrai o nome do arquivo do header ou cria um padrão
      const contentDisposition = response.headers["content-disposition"];
      let filename = `clientes_export.${apiParams.format}`;

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
      console.error("Failed to export clients:", err);
      const errorMessage = "Falha na exportação. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchClients,
    createClient,
    getClient,
    updateClient,
    deleteClient,
    exportClients,
  };
}
