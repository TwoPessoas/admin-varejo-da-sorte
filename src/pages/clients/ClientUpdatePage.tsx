import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react"; // Adicionado Loader para carregamento
import useClient from "../../hooks/useClient"; // Certifique-se que o caminho está correto
import ClientForm from "./components/ClientForm";

// Tipo para os valores iniciais, deve ser compatível com ClientFormValues
interface ClientFormValues {
  name: string;
  cpf: string;
  birthday?: string;
  cel?: string;
  email?: string;
  isPreRegister: boolean;
}

export default function ClientUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do useClient
  // isLoading aqui é para o 'updateClient', não para o 'getClient' inicial.
  const { getClient, updateClient, isLoading: isUpdatingClient } = useClient();

  // Estados locais para gerenciar o carregamento e os dados do cliente para o formulário
  const [initialClientData, setInitialClientData] =
    useState<Partial<ClientFormValues> | null>(null);
  const [isFetchingClient, setIsFetchingClient] = useState(true); // Estado de carregamento para a busca inicial
  const [fetchClientError, setFetchClientError] = useState<string | null>(null); // Estado de erro para a busca inicial

  // Efeito para buscar os dados do cliente ao carregar a página ou mudar o ID
  useEffect(() => {
    const fetchCurrentClient = async () => {
      if (!id) {
        setFetchClientError("ID do cliente não fornecido na URL.");
        setIsFetchingClient(false);
        return;
      }

      setIsFetchingClient(true);
      setFetchClientError(null); // Limpa erros anteriores de busca
      setInitialClientData(null); // Limpa dados anteriores

      try {
        const client = await getClient(Number(id)); // Chama o getClient do hook
        if (client) {
          // Formata a data de aniversário se existir (removendo a parte da hora)
          setInitialClientData({
            name: client.name,
            cpf: client.cpf,
            birthday: client.birthday ? client.birthday.split("T")[0] : "",
            cel: client.cel ? client.cel : undefined,
            email: client.email ? client.email : undefined,
            isPreRegister: client.isPreRegister,
          });
        } else {
          setFetchClientError(
            "Cliente não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar cliente:", err);
        setFetchClientError(
          "Falha ao carregar os dados do cliente. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingClient(false);
      }
    };

    fetchCurrentClient();
  }, [id]); // Adiciona getClient nas dependências para ESLint

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: ClientFormValues) => {
      if (!id) {
        setFetchClientError(
          "Não foi possível atualizar: ID do cliente não encontrado."
        );
        return;
      }
      // O useClient já dispara toasts de sucesso/erro para o updateClient
      // Não precisamos mais de 'alert' ou 'setFormError' locais.
      const updatedClient = await updateClient(Number(id), data);
      if (updatedClient) {
        // Navega após o toast de sucesso ser disparado pelo hook
        navigate("/clients");
      }
      // Se updatedClient for null, o toast.error já foi disparado pelo useClient
    },
    [id, updateClient, navigate]
  );

  // Exibição de estado de carregamento inicial
  if (isFetchingClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-3 text-lg text-gray-700">
          Carregando dados do cliente...
        </p>
      </div>
    );
  }

  // Exibição de erro na busca inicial do cliente
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

  // Se initialClientData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialClientData) {
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

  // Renderiza o formulário quando os dados estão prontos
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
        <h1 className="page-title">Atualizar Cliente</h1>
      </div>

      {/* A mensagem de erro para 'updateClient' será tratada pelo useClient com toasts */}
      {/* Se o 'error' do useClient for relevante para a UI aqui, você pode adicioná-lo.
          Por exemplo, se o erro de 'updateClient' não for um toast e você quiser exibi-lo na tela.
          No entanto, com os toasts, isso se torna redundante para a operação de update. */}
      {/* {isUpdatingClient && updateError && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{updateError}</p>
        </div>
      )} */}

      {/* Formulário de Atualização */}
      <ClientForm
        initialValues={initialClientData} // Passa os dados do cliente carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingClient} // Passa o estado de carregamento do updateClient
      />
    </div>
  );
}
