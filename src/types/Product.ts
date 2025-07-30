export interface Product {
  id: number;
  ean: string;
  description: string | null;
  brand: string | null;
  createdAt: string; // Formato ISO string (timestamptz)
  updatedAt: string; // Formato ISO string (timestamptz)
}

export interface PaginatedProductResponse {
  data: Product[];
  status: string;
  pagination: {
    totalEntities: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  ean?: string;
  description?: string;
  brand?: string;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface ExportProductsParams {
  ean?: string;
  description?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
  format?: "csv" | "xlsx" | "pdf";
}

export interface UseProduct {
  products: Product[];
  totalEntities: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<Product | null>;
  getProduct: (id: number) => Promise<Product | null>;
  updateProduct: (
    id: number,
    productData: Partial<Product>
  ) => Promise<Product | null>;
  deleteProduct: (id: number) => Promise<boolean>;
  exportProducts: (params?: ExportProductsParams) => Promise<boolean>;
}

export interface ProductFormValues {
  ean: string; // EAN como string para o input, será transformado em number pelo zod
  description?: string;
  brand?: string;
}