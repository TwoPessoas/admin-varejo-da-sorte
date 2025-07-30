import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast"; // Para notificações visuais
import useProduct from "../../hooks/useProducts";
import ProductForm from "./components/ProductForm";

export default function ProductCreatePage() {
  const { createProduct, isLoading } = useProduct(); // Usa o hook useProduct
  const navigate = useNavigate();

  // Função para lidar com o envio do formulário de criação de produto
  const handleCreateProduct = async (productData: any) => {
    try {
      // Chama a função createProduct do hook, passando os dados do formulário
      const newProduct = await createProduct(productData);

      if (newProduct) {
        // Se a criação foi bem-sucedida, redireciona para a listagem de produtos
        navigate("/products");
      } else {
        // Se newProduct for null, significa que houve um erro tratado no useProduct
        // e o toast.error já foi exibido por lá.
        // Adicionamos um erro genérico aqui caso o useProduct não tenha emitido um toast específico.
        toast.error(
          "Erro ao criar produto. Por favor, verifique os dados e tente novamente."
        );
      }
    } catch (err: any) {
      console.error("Erro inesperado ao criar produto:", err);
      // Exibe um toast para erros inesperados não tratados pelo useProduct
      toast.error(
        "Erro inesperado ao criar produto. Tente novamente mais tarde."
      );
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/products")} // Botão de voltar para a lista de produtos
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Novo Produto</h1> {/* Título da página */}
      </div>

      {/* Componente de Formulário Reutilizável */}
      {/* Ele receberá a função handleCreateProduct para o onSubmit e o estado isLoading */}
      <ProductForm onSubmit={handleCreateProduct} isLoading={isLoading} />
    </div>
  );
}