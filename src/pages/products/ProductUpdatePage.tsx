import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react";
import useProduct from "../../hooks/useProducts";
import ProductForm from "./components/ProductForm";
import type { ProductFormValues } from "../../types/Product";

export default function ProductUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID do produto da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do useProduct
  // isLoading aqui é para o 'updateProduct', enquanto isFetchingProduct é para o 'getProduct' inicial.
  const {
    getProduct,
    updateProduct,
    isLoading: isUpdatingProduct,
  } = useProduct();

  // Estados locais para gerenciar o carregamento e os dados do produto para o formulário
  const [initialProductData, setInitialProductData] =
    useState<Partial<ProductFormValues> | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true); // Estado de carregamento para a busca inicial
  const [fetchProductError, setFetchProductError] = useState<string | null>(
    null
  ); // Estado de erro para a busca inicial

  // Efeito para buscar os dados do produto ao carregar a página ou mudar o ID
  useEffect(() => {
    const fetchCurrentProduct = async () => {
      if (!id) {
        setFetchProductError("ID do produto não fornecido na URL.");
        setIsFetchingProduct(false);
        return;
      }

      setIsFetchingProduct(true);
      setFetchProductError(null); // Limpa erros anteriores de busca
      setInitialProductData(null); // Limpa dados anteriores

      try {
        const product = await getProduct(Number(id)); // Chama o getProduct do hook
        if (product) {
          // Prepara os dados do produto para o ProductForm
          // Atenção: EAN é um número no backend, mas o formulário espera string para o input.
          setInitialProductData({
            ean: product.ean.toString(), // Converte EAN para string para o input do formulário
            description: product.description || undefined, // Garante undefined se for null
            brand: product.brand || undefined, // Garante undefined se for null
          });
        } else {
          setFetchProductError(
            "Produto não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar produto:", err);
        setFetchProductError(
          "Falha ao carregar os dados do produto. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingProduct(false);
      }
    };

    fetchCurrentProduct();
  }, [id, getProduct]); // Adiciona getProduct nas dependências para ESLint

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: ProductFormValues) => {
      if (!id) {
        setFetchProductError(
          "Não foi possível atualizar: ID do produto não encontrado."
        );
        return;
      }
      // O useProduct já dispara toasts de sucesso/erro para o updateProduct
      const updatedProduct = await updateProduct(Number(id), data);
      if (updatedProduct) {
        // Navega após o toast de sucesso ser disparado pelo hook
        navigate("/products");
      }
      // Se updatedProduct for null, o toast.error já foi disparado pelo useProduct
    },
    [id, updateProduct, navigate]
  );

  // Exibição de estado de carregamento inicial
  if (isFetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-3 text-lg text-gray-700">
          Carregando dados do produto...
        </p>
      </div>
    );
  }

  // Exibição de erro na busca inicial do produto
  if (fetchProductError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar produto
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchProductError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/products")} // Rota adaptada
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de produtos
        </button>
      </div>
    );
  }

  // Se initialProductData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialProductData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Produto não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum produto.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/products")} // Rota adaptada
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de produtos
        </button>
      </div>
    );
  }

  // Renderiza o formulário quando os dados estão prontos
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/products")} // Rota adaptada
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Atualizar Produto</h1>{" "}
        {/* Título adaptado */}
      </div>

      {/* Formulário de Atualização */}
      <ProductForm
        initialValues={initialProductData} // Passa os dados do produto carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingProduct} // Passa o estado de carregamento do updateProduct
      />
    </div>
  );
}
