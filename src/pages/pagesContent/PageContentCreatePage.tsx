// src/pages/PageContentCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast"; // Importa a função toast para notificações
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

export default function PageContentCreatePage() {
  const { createPageContent, isLoading } = usePageContent(); // Usa o hook usePageContent
  const navigate = useNavigate();

  // Lidar com o envio do formulário de criação
  const handleCreate = async (data: PageContentFormValues) => {
    try {
      const newPageContent = await createPageContent(data); // Chama a função de criação do hook
      if (newPageContent) {
        // Se a criação for bem-sucedida, redireciona para a listagem
        navigate("/pages-content"); // Redireciona para a listagem de conteúdos de página
      } else {
        // Se newPageContent for null, significa que houve um erro tratado no usePageContent
        // e o erro já foi setado lá e uma toast message exibida.
        // Podemos adicionar um fallback caso a toast message não seja suficiente.
        toast.error(
          "Erro ao criar conteúdo de página. Por favor, verifique os dados e tente novamente."
        );
      }
    } catch (err: any) {
      console.error("Erro ao criar conteúdo de página:", err);
      // Aqui você pode ser mais específico com o erro vindo da API,
      // ou usar a mensagem de erro do usePageContent se ela for relevante.
      toast.error(
        "Erro inesperado ao criar conteúdo de página. Tente novamente mais tarde."
      );
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/pages-content")} // Redireciona para a listagem de conteúdos de página
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Novo Conteúdo de Página</h1>
      </div>

      {/* Formulário Reutilizável */}
      <PageContentForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
