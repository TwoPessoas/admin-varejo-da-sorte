export interface Client {
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
export interface PaginatedClientResponse {
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
export interface FetchClientsParams {
  page?: number;
  limit?: number;
  id?: string; // Novo: Filtro por ID
  name?: string; // Novo: Filtro por Nome
  cpf?: string; // Novo: Filtro por CPF
  cel?: string; // Novo: Filtro por Celular
}

// Hook return structure
export interface UseClient {
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

export interface ExportClientsParams {
  name?: string;
  cpf?: string;
  cel?: string;
  // Faixa de datas (opcionais)
  startDate?: string; // formato: YYYY-MM-DD
  endDate?: string; // formato: YYYY-MM-DD
  // Formato de exportação (futuro)
  format?: "csv" | "xlsx" | "pdf";
}