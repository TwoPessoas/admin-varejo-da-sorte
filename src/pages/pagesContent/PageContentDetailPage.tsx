import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  Edit,
  Trash2,
  XCircle,
  // CheckCircle e Award não são usados para PageContent
} from "lucide-react";
import usePageContent from "../../hooks/usePageContent"; // Importa o hook usePageContent
import DateUtils from "../../utils/DateUtils"; // Para formatação de datas
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

// Definindo a interface PageContent, conforme definido em usePageContent.ts
interface PageContent {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContentViewerProps {
  content: string;
}

function ContentViewer({ content }: ContentViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: true, // Permite clicar nos links
      }),
      Image,
    ],
    content,
    editable: false, // Torna o editor somente leitura
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4",
      },
    },
  });

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      <EditorContent editor={editor} />
    </div>
  );
}

export default function PageContentDetailPage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const { getPageContent, deletePageContent, isLoading } = usePageContent(); // Usa o hook usePageContent
  // isLoading aqui é para deletePageContent ou para chamadas gerais do hook se você o usar mais genericamente
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isFetchingPageContent, setIsFetchingPageContent] = useState(true); // Para o carregamento inicial do PageContent
  const [fetchPageContentError, setFetchPageContentError] = useState<
    string | null
  >(null); // Para erros no carregamento inicial
  const [deletingPageContentModal, setDeletingPageContentModal] = useState<
    number | null
  >(null); // Para o modal de exclusão

  const navigate = useNavigate();

  // Efeito para buscar os dados do PageContent
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) {
        setFetchPageContentError(
          "ID do conteúdo de página não fornecido na URL."
        );
        setIsFetchingPageContent(false);
        return;
      }

      setIsFetchingPageContent(true);
      setFetchPageContentError(null);
      setPageContent(null); // Limpa dados anteriores

      try {
        const data = await getPageContent(Number(id)); // Chama getPageContent
        if (data) {
          setPageContent(data);
        } else {
          setFetchPageContentError(
            "Conteúdo de página não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch page content:", err);
        setFetchPageContentError(
          "Falha ao carregar os detalhes do conteúdo de página. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingPageContent(false);
      }
    };

    fetchContent();
  }, [id]); // Adiciona getPageContent nas dependências para ESLint

  // Lida com a exclusão do PageContent
  const handleDelete = async () => {
    if (pageContent && pageContent.id) {
      const success = await deletePageContent(pageContent.id); // Usa deletePageContent
      if (success) {
        navigate("/pages-content"); // Redireciona para a lista após a exclusão
      }
      setDeletingPageContentModal(null); // Fecha o modal
    }
  };

  // Handle loading state for initial fetch
  if (isFetchingPageContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes do conteúdo de página...
        </p>
      </div>
    );
  }

  // Handle error state for initial fetch
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

  // Handle no data state (PageContent not found after successful fetch, or ID was missing)
  if (!pageContent) {
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

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <button
          className="btn btn-secondary mb-4 sm:mb-0" // Adicionado margem para mobile
          onClick={() => navigate("/pages-content")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Conteúdo de Página</h1>
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/pages-content/${pageContent.id}/edit`)} // Rota para editar
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingPageContentModal(pageContent.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações do Conteúdo de Página */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {pageContent.title || "Conteúdo Sem Título"}
          </h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {pageContent.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados Gerais */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Informações Gerais
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Título</h4>
            <p className="text-gray-800">
              {pageContent.title || "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Slug</h4>
            <p className="text-gray-800">
              {pageContent.slug || "Não informado"}
            </p>
          </div>
          {/* Conteúdo HTML/Texto */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Conteúdo
            </h4>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Visualização do Conteúdo
            </h4>
            {pageContent.content ? (
              <div className="max-h-96 overflow-auto">
                <ContentViewer content={pageContent.content} />
              </div>
            ) : (
              <div className="p-4 bg-gray-100 rounded-md text-gray-500 italic">
                Nenhum conteúdo definido.
              </div>
            )}
          </div>
          {/* Dados do Sistema */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Informações do Sistema
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Criado em</h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(pageContent.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(pageContent.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão */}
      {deletingPageContentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o conteúdo de página{" "}
                <strong>
                  {pageContent.title || "Sem Título"} (ID:{" "}
                  {deletingPageContentModal})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingPageContentModal(null)}
                disabled={isLoading} // isLoading do usePageContent para a operação de delete
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
