import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useClient from "../../hooks/useClient";
import toast from "react-hot-toast"; // Importe a função toast
import ClientForm from "./components/ClientForm";

export default function ClientCreate() {
  const { createClient, isLoading } = useClient();
  const navigate = useNavigate();
  // Não precisamos mais de 'formError' no estado local se usarmos toast.error
  // const [formError, setFormError] = useState<string | null>(null);

  // Lidar com o envio do formulário
  const handleCreate = async (data: any) => {
    // setFormError(null); // Não é mais necessário limpar erros anteriores aqui

    try {
      const newClient = await createClient(data);
      if (newClient) {
        navigate("/clients"); // Redireciona para a listagem
      } else {
        // Se newClient for null, significa que houve um erro tratado no useClient
        // e o erro já foi setado lá, então mostramos o erro via toast
        toast.error(
          "Erro ao criar cliente. Por favor, verifique os dados e tente novamente."
        );
      }
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      // Aqui você pode ser mais específico com o erro vindo da API,
      // ou usar a mensagem de erro do useClient se ela for relevante.
      toast.error(
        "Erro inesperado ao criar cliente. Tente novamente mais tarde."
      );
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Novo Cliente</h1>
      </div>

      {/* Não precisamos mais deste bloco de erro explícito se usarmos toast.error */}
      {/* {formError && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{formError}</p>
        </div>
      )} */}

      {/* Formulário Reutilizável */}
      <ClientForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
