import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, ArrowLeft, Edit, Trash2, XCircle } from "lucide-react"; // Award, CheckCircle foram removidos por não serem aplicáveis a produtos
import useProduct from "../../hooks/useProducts";
import DateUtils from "../../utils/DateUtils";
import type { Product } from "../../types/Product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID do produto da URL
  const { getProduct, deleteProduct, isLoading } = useProduct(); // Usa o hook useProduct
  const [product, setProduct] = useState<Product | null>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(true); // Para o carregamento inicial dos detalhes
  const [fetchProductError, setFetchProductError] = useState<string | null>(
    null
  ); // Para erros no carregamento inicial
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null); // Para o modal de exclusão
  const navigate = useNavigate();

  // Efeito para buscar os dados do produto
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) {
        setFetchProductError("ID do produto não fornecido na URL.");
        setIsFetchingProduct(false);
        return;
      }

      setIsFetchingProduct(true);
      setFetchProductError(null);
      setProduct(null); // Limpa dados anteriores

      try {
        const data = await getProduct(Number(id)); // Chama getProduct do hook
        if (data) {
          setProduct(data);
        } else {
          setFetchProductError(
            "Produto não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch product:", err);
        setFetchProductError(
          "Falha ao carregar os detalhes do produto. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingProduct(false);
      }
    };

    fetchProductDetails();
  }, [id, getProduct]); // getProduct adicionado nas dependências para ESLint

  // Lida com a exclusão do produto
  const handleDelete = useCallback(async () => {
    if (product && product.id) {
      const success = await deleteProduct(product.id); // Chama deleteProduct do hook
      if (success) {
        navigate("/products"); // Redireciona para a lista após a exclusão
      }
      setDeletingProduct(null); // Fecha o modal
    }
  }, [product, deleteProduct, navigate]);

  // Handle loading state for initial fetch
  if (isFetchingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes do produto...
        </p>
      </div>
    );
  }

  // Handle error state for initial fetch
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

  // Handle no data state (product not found after successful fetch, or ID was missing)
  if (!product) {
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

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <button
          className="btn btn-secondary mb-4 sm:mb-0" // Adicionado margem para mobile
          onClick={() => navigate("/products")} // Rota adaptada
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Produto</h1>{" "}
        {/* Título adaptado */}
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/products/${product.id}/edit`)} // Rota adaptada
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingProduct(product.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações do Produto */}
      <div className="card">
        <div className="card-header">
          {/* Usamos EAN como título principal, ou uma descrição se EAN não estiver disponível */}
          <h3 className="card-title">{product.ean || "Produto Sem EAN"}</h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {product.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados do Produto */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Informações do Produto
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">EAN</h4>
            <p className="text-gray-800">{product.ean || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Descrição</h4>
            <p className="text-gray-800">
              {product.description || "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Marca</h4>
            <p className="text-gray-800">{product.brand || "Não informado"}</p>
          </div>
          {/* As seções "Contato" e "Status do Cliente" foram removidas, pois não se aplicam a produtos */}

          {/* Dados do Sistema */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Informações do Sistema
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Criado em</h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(product.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(product.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão */}
      {deletingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o produto de EAN{" "}
                <strong>
                  {product.ean || "Não Informado"} (ID: {deletingProduct})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingProduct(null)}
                disabled={isLoading} // isLoading do useProduct para a operação de delete
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
