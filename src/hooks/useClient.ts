// src/hooks/useClient.ts
import { useState } from 'react';
import api from '../services/api';

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
  total: number;
  currentPage: number;
  totalPages: number;
}

// Structure for query parameters when fetching clients
interface FetchClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Hook return structure
interface UseClient {
  clients: Client[];
  totalClients: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchClients: (params?: FetchClientsParams) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<Client | null>;
  getClient: (id: number) => Promise<Client | null>;
  updateClient: (id: number, clientData: Partial<Client>) => Promise<Client | null>;
  deleteClient: (id: number) => Promise<boolean>;
}

export default function useClient(): UseClient {
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all clients with optional query parameters
  const fetchClients = async (params?: FetchClientsParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<PaginatedClientResponse>('/clients', {
        params,
      });

      setClients(response.data.data);
      setTotalClients(response.data.total);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setError('Failed to fetch clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new client
  const createClient = async (clientData: Partial<Client>): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<Client>('/clients', clientData);
      return response.data;
    } catch (err: any) {
      console.error('Failed to create client:', err);
      setError('Failed to create client. Please try again.');
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
      console.error('Failed to fetch client:', err);
      setError('Failed to fetch client data. Please try again.');
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
      return response.data;
    } catch (err: any) {
      console.error('Failed to update client:', err);
      setError('Failed to update client data. Please try again.');
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
      return true;
    } catch (err: any) {
      console.error('Failed to delete client:', err);
      setError('Failed to delete client. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clients,
    totalClients,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchClients,
    createClient,
    getClient,
    updateClient,
    deleteClient,
  };
}