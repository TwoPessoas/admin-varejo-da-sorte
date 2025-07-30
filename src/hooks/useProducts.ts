// src/hooks/useProduct.ts
import { useState } from "react";
import api from "../services/api"; // Certifique-se de que o caminho para o seu axios instance está correto
import ObjectUtils from "../utils/ObjectUtils"; // Assumindo que ObjectUtils.ts está em ../utils
import toast from "react-hot-toast"; // Para notificações de sucesso/erro
import type {
  ExportProductsParams,
  FetchProductsParams,
  PaginatedProductResponse,
  Product,
  UseProduct,
} from "../types/Product";

export default function useProduct(): UseProduct {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalEntities, setTotalEntities] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca a lista de produtos com opções de paginação e filtro.
   * Os campos pesquisáveis na API são 'ean', 'description' e 'brand'.
   */
  const fetchProducts = async (params?: FetchProductsParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Cria um objeto de parâmetros para enviar à API,
      // incluindo apenas os campos que possuem valor definido para a busca.
      const searchParams: { [key: string]: any } = {
        ean: params?.ean,
        description: params?.description,
        brand: params?.brand,
      };
      // Remove parâmetros nulos/indefinidos do objeto de busca
      ObjectUtils.removeParamsNuable(searchParams);

      // Constrói os parâmetros gerais da API, incluindo paginação e ordenação.
      const apiParams: { [key: string]: any } = {
        page: params?.page,
        limit: params?.limit,
        orderBy: params?.orderBy,
        orderDirection: params?.orderDirection,
      };

      // Se houver filtros de busca, stringify para o parâmetro 'search'
      if (Object.keys(searchParams).length > 0) {
        apiParams.search = JSON.stringify(searchParams);
      }
      // Remove parâmetros nulos/indefinidos dos parâmetros da API
      ObjectUtils.removeParamsNuable(apiParams);

      const response = await api.get<PaginatedProductResponse>("/products", {
        params: apiParams,
      });

      setProducts(response.data.data);
      setTotalEntities(response.data.pagination.totalEntities);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      const errorMessage =
        "Falha ao buscar produtos. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cria um novo produto.
   */
  const createProduct = async (
    productData: Partial<Product>
  ): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<Product>("/products", productData);
      toast.success("Produto criado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to create product:", err);
      const errorMessage =
        "Falha ao criar produto. Por favor, verifique os dados.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Busca um produto específico por ID.
   */
  const getProduct = async (id: number): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (err: any) {
      console.error("Failed to fetch product:", err);
      setError("Falha ao buscar dados do produto. Por favor, tente novamente.");
      toast.error("Falha ao buscar dados do produto.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza as informações de um produto existente.
   */
  const updateProduct = async (
    id: number,
    productData: Partial<Product>
  ): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put<Product>(`/products/${id}`, productData);
      toast.success("Produto atualizado com sucesso!");
      return response.data;
    } catch (err: any) {
      console.error("Failed to update product:", err);
      const errorMessage =
        "Falha ao atualizar produto. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exclui um produto por ID.
   */
  const deleteProduct = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/products/${id}`);
      toast.success("Produto excluído com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      const errorMessage =
        "Falha ao excluir produto. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Exporta a lista de produtos com base nos filtros fornecidos.
   */
  const exportProducts = async (
    params?: ExportProductsParams
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams: { [key: string]: any } = {
        ean: params?.ean,
        description: params?.description,
        brand: params?.brand,
      };
      // Remove propriedades vazias
      ObjectUtils.removeParamsNuable(searchParams);

      // Constrói os parâmetros para a API, incluindo filtros de data e formato.
      const apiParams: { [key: string]: any } = {
        startDate: params?.startDate,
        endDate: params?.endDate,
        format: params?.format || "csv", // Padrão CSV se não especificado
      };

      // Se houver filtros de busca, stringify para o parâmetro 'search'
      if (Object.keys(searchParams).length > 0) {
        apiParams.search = JSON.stringify(searchParams);
      }
      // Remove propriedades vazias dos parâmetros finais da API
      ObjectUtils.removeParamsNuable(apiParams);

      // Faz a requisição para exportação, esperando um blob (arquivo) como resposta.
      const response = await api.get("/products/export", {
        params: apiParams,
        responseType: "blob", // Importante para download de arquivos
      });

      // Cria um Blob a partir da resposta e define o tipo de conteúdo.
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      // Tenta extrair o nome do arquivo do header 'Content-Disposition' ou define um padrão.
      const contentDisposition = response.headers["content-disposition"];
      let filename = `produtos_export.${apiParams.format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Cria um link temporário para download no navegador.
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Nome do arquivo para download
      document.body.appendChild(link);
      link.click(); // Simula o clique no link para iniciar o download

      // Limpa o link temporário e revoga a URL do objeto.
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportação realizada com sucesso!");
      return true;
    } catch (err: any) {
      console.error("Failed to export products:", err);
      const errorMessage = "Falha na exportação. Por favor, tente novamente.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    totalEntities,
    currentPage,
    totalPages,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    exportProducts,
  };
}
