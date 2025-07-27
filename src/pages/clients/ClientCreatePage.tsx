import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useClient from "../../hooks/useClient";
import ClientForm from "./components/ClientForm";

export default function ClientCreate() {
  const { createClient, isLoading } = useClient();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  // Lidar com o envio do formulário
  const handleCreate = async (data: any) => {
    setFormError(null); // Limpa erros anteriores, se houver
    try {
      const newClient = await createClient(data);
      if (newClient) {
        alert("Cliente criado com sucesso!");
        navigate("/clients"); // Redireciona para a listagem
      }
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      setFormError("Erro ao criar cliente. Tente novamente mais tarde.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
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

      {/* Mensagem de erro global */}
      {formError && (
        <div className="alert alert-error">
          <p>{formError}</p>
        </div>
      )}

      {/* Formulário Reutilizável */}
      <ClientForm
        onSubmit={handleCreate} // Chama a função para criar o cliente
        isLoading={isLoading} // Passa o estado de carregamento
      />
    </div>
  );
}