import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// 1. Defina a interface para o tipo Produto (baseado no seu backend)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: string;
}

// 2. Defina a interface para a resposta da API (com paginação)
interface ApiResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export const useProducts = () => {
  // Estados para dados, carregamento e erros
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação e filtro
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Função para buscar os dados, agora usando useCallback
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Constrói os parâmetros da query para a API
      const params = new URLSearchParams({
        page: String(page),
        limit: '10', // Itens por página
        search: searchTerm,
      });

      const response = await api.get<ApiResponse>(`/products?${params.toString()}`);
      
      setProducts(response.data.data);
      setTotalPages(response.data.meta.last_page);

    } catch (err) {
      setError('Não foi possível carregar os produtos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  // 4. useEffect para chamar a busca quando a página ou o filtro mudarem
  useEffect(() => {
    // Usamos um debounce para o filtro de busca para não sobrecarregar a API
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500); // Aguarda 500ms após o usuário parar de digitar

    return () => clearTimeout(debounceTimer); // Limpa o timer
  }, [fetchProducts]);

  // 5. Retorna tudo que o componente de UI vai precisar
  return {
    products,
    isLoading,
    error,
    page,
    totalPages,
    searchTerm,
    setPage,
    setSearchTerm,
  };
};