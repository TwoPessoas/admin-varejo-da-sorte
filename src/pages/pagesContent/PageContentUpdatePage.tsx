// src/pages/PageContentUpdatePage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react";
import { z } from "zod"; // Importa o Zod para referenciar o tipo de dados do formulário
import usePageContent from "../../hooks/usePageContent";
import PageContentForm from "./components/PageContentForm";

// Esquema de validação Zod para os dados do Conteúdo de Página (precisamos do tipo aqui)
const pageContentSchema = z.object({
  title: z.string().nonempty("O título é obrigatório."),
  slug: z.string().optional(),
  content: z.string().optional(),
});
// Tipo inferido do esquema Zod para os valores do formulário
type PageContentFormValues = z.infer<typeof pageContentSchema>;

export default function PageContentUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do usePageContent
  const {
    getPageContent,
    updatePageContent,
    isLoading: isUpdatingPageContent, // isLoading para a operação de update
  } = usePageContent();

  // Estados locais para gerenciar o carregamento e os dados do conteúdo de página para o formulário
  const [initialPageContentData, setInitialPageContentData] =
    useState<Partial<PageContentFormValues> | null>(null);
  const [isFetchingPageContent, setIsFetchingPageContent] = useState(true); // Estado de carregamento para a busca inicial
  const [fetchPageContentError, setFetchPageContentError] = useState<
    string | null
  >(null); // Estado de erro para a busca inicial

  // Efeito para buscar os dados do conteúdo de página ao carregar a página ou mudar o ID
  useEffect(() => {
    const fetchCurrentPageContent = async () => {
      if (!id) {
        setFetchPageContentError(
          "ID do conteúdo de página não fornecido na URL."
        );
        setIsFetchingPageContent(false);
        return;
      }

      setIsFetchingPageContent(true);
      setFetchPageContentError(null); // Limpa erros anteriores de busca
      setInitialPageContentData(null); // Limpa dados anteriores

      try {
        const pageContent = await getPageContent(Number(id)); // Chama o getPageContent do hook
        if (pageContent) {
          // Mapeia os dados do PageContent para o formato esperado pelo formulário
          setInitialPageContentData({
            title: pageContent.title,
            slug: pageContent.slug,
            content: pageContent.content || "", // Garante que 'content' é uma string vazia se for null
          });
        } else {
          setFetchPageContentError(
            "Conteúdo de página não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar conteúdo de página:", err);
        setFetchPageContentError(
          "Falha ao carregar os dados do conteúdo de página. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingPageContent(false);
      }
    };

    fetchCurrentPageContent();
  }, [id]); // Adiciona getPageContent nas dependências para ESLint

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: PageContentFormValues) => {
      if (!id) {
        setFetchPageContentError(
          "Não foi possível atualizar: ID do conteúdo de página não encontrado."
        );
        return;
      }
      // O usePageContent já dispara toasts de sucesso/erro para o updatePageContent
      const updatedPageContent = await updatePageContent(Number(id), data);
      if (updatedPageContent) {
        // Navega após o toast de sucesso ser disparado pelo hook
        navigate("/pages-content");
      }
      // Se updatedPageContent for null, o toast.error já foi disparado pelo usePageContent
    },
    [id, updatePageContent, navigate]
  );

  // Exibição de estado de carregamento inicial
  if (isFetchingPageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-3 text-lg text-gray-700">
          Carregando dados do conteúdo de página...
        </p>
      </div>
    );
  }

  // Exibição de erro na busca inicial do conteúdo de página
  if (fetchPageContentError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar conteúdo de página
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {fetchPageContentError}
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/pages-content")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de conteúdos de página
        </button>
      </div>
    );
  }

  // Se initialPageContentData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialPageContentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Conteúdo de página não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum conteúdo de página.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/pages-content")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de conteúdos de página
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
          onClick={() => navigate("/pages-content")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Atualizar Conteúdo de Página</h1>
      </div>

      {/* Formulário de Atualização */}
      <PageContentForm
        initialValues={initialPageContentData} // Passa os dados do conteúdo de página carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingPageContent} // Passa o estado de carregamento do updatePageContent
      />
    </div>
  );
}
