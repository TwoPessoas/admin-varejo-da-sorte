import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  Award,
} from "lucide-react"; // Adicionado Award para MegaWinner
import useClient from "../../hooks/useClient";
import DateUtils from "../../utils/DateUtils";
import type { Client } from "../../types/Client";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getClient, deleteClient, isLoading } = useClient(); // isLoading aqui é para deleteClient
  const [client, setClient] = useState<Client | null>(null);
  const [isFetchingClient, setIsFetchingClient] = useState(true); // Para o carregamento inicial
  const [fetchClientError, setFetchClientError] = useState<string | null>(null); // Para erros no carregamento inicial
  const [deletingClient, setDeletingClient] = useState<number | null>(null); // Para o modal de exclusão
  const navigate = useNavigate();

  // Efeito para buscar os dados do cliente
  useEffect(() => {
    const fetchClient = async () => {
      if (!id) {
        setFetchClientError("ID do cliente não fornecido na URL.");
        setIsFetchingClient(false);
        return;
      }

      setIsFetchingClient(true);
      setFetchClientError(null);
      setClient(null); // Limpa dados anteriores

      try {
        const data = await getClient(Number(id));
        if (data) {
          setClient(data);
        } else {
          setFetchClientError(
            "Cliente não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch client:", err);
        setFetchClientError(
          "Falha ao carregar os detalhes do cliente. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingClient(false);
      }
    };

    fetchClient();
  }, [id]); // Adiciona getClient nas dependências para ESLint

  // Lida com a exclusão do cliente
  const handleDelete = useCallback(async () => {
    if (client && client.id) {
      const success = await deleteClient(client.id); // O useClient já dispara toast de sucesso/erro
      if (success) {
        navigate("/clients"); // Redireciona para a lista após a exclusão
      }
      setDeletingClient(null); // Fecha o modal
    }
  }, [client, deleteClient, navigate]);

  // Handle loading state for initial fetch
  if (isFetchingClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes do cliente...
        </p>
      </div>
    );
  }

  // Handle error state for initial fetch
  if (fetchClientError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar cliente
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchClientError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de clientes
        </button>
      </div>
    );
  }

  // Handle no data state (client not found after successful fetch, or ID was missing)
  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Cliente não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum cliente.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de clientes
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
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Cliente</h1>
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/clients/${client.id}/edit`)}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingClient(client.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Exibição de Erros do useClient (se houver, e se não for tratado pelo fetchClientError) */}
      {/* No seu useClient, os erros do getClient (que é chamado aqui) já setam o estado 'error'.
          Se você quiser um alerta visual além da tela de erro inicial, descomente abaixo.
          No entanto, a tela de erro inicial já é bem completa.
      {error && !isFetchingClient && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">Erro geral: {error}.</p>
        </div>
      )} */}

      {/* Informações do Cliente */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{client.name || "Cliente Sem Nome"}</h3>
          <p className="card-subtitle text-sm text-gray-600">ID: {client.id}</p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {" "}
          {/* Grid para organizar informações */}
          {/* Dados Pessoais */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Dados Pessoais
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">CPF</h4>
            <p className="text-gray-800">{client.cpf || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Data de Nascimento
            </h4>
            <p className="text-gray-800">
              {client.birthday
                ? new Date(client.birthday).toLocaleDateString("pt-BR")
                : "Não informado"}
            </p>
          </div>
          {/* Contato */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Contato
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Celular</h4>
            <p className="text-gray-800">{client.cel || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">E-mail</h4>
            <p className="text-gray-800">{client.email || "Não informado"}</p>
          </div>
          {/* Status do Cliente */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Status</h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Pré-cadastro</h4>
            <p
              className={`text-sm font-medium flex items-center ${
                client.isPreRegister ? "text-green-600" : "text-gray-500"
              }`}
            >
              {client.isPreRegister ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {client.isPreRegister ? "Sim" : "Não"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Ganhador Mega</h4>
            <p
              className={`text-sm font-medium flex items-center ${
                client.isMegaWinner ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {client.isMegaWinner ? (
                <Award className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {client.isMegaWinner ? "Sim" : "Não"}
            </p>
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
              {DateUtils.toDateTimePtBr(client.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(client.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão (Reutilizado da ClientListPage) */}
      {deletingClient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o cliente{" "}
                <strong>
                  {client.name || "Sem Nome"} (ID: {deletingClient})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingClient(null)}
                disabled={isLoading} // isLoading do useClient para a operação de delete
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
