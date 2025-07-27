// src/pages/ClientUpdate.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useClient from "../../hooks/useClient";
import ClientForm from "./components/ClientForm";

export default function ClientUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, updateClient, isLoading, error } = useClient();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Busca o cliente ao carregar a página
  useEffect(() => {
    const fetchClient = async () => {
      if (id) {
        const client = await getClient(Number(id));
        if (client) {
          setInitialValues({
            name: client.name,
            cpf: client.cpf,
            birthday: client.birthday ? client.birthday.split("T")[0] : "",
            cel: client.cel,
            email: client.email,
            isPreRegister: client.isPreRegister,
          });
        }
      }
    };

    fetchClient();
  }, [id]);

  // Submissão do formulário
  const handleUpdate = async (data: any) => {
    try {
      if (id) {
        await updateClient(Number(id), data);
        alert("Cliente atualizado com sucesso!");
        navigate("/clients");
      }
    } catch (err: any) {
      console.error("Erro ao atualizar cliente:", err);
      setFormError("Erro ao atualizar cliente. Por favor, tente novamente.");
    }
  };

  if (!initialValues) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

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
        <h1 className="page-title">Atualizar Cliente</h1>
      </div>

      {/* Mensagem de erro global */}
      {formError && <div className="alert alert-error">{formError}</div>}

      {/* Formulário */}
      <ClientForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
}