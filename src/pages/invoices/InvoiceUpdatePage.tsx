// src/pages/InvoiceUpdatePage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react";
import toast from "react-hot-toast"; // Para notificações
import useInvoice from "../../hooks/useInvoice";
import useClient from "../../hooks/useClient";
import type { InvoiceFormValues } from "./components/InvoiceForm";
import InvoiceForm from "./components/InvoiceForm";

export default function InvoiceUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da fatura da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do useInvoice
  // isUpdatingInvoice será usado para o estado de carregamento da atualização (se implementada)
  const { getInvoice, /* updateInvoice, */ isLoading: isUpdatingInvoice } =
    useInvoice();

  // Hook para buscar a lista de clientes (necessário para o select de cliente no formulário)
  const {
    fetchClients,
    clients: allClientsFromHook,
    isLoading: isFetchingClients,
  } = useClient();

  // Estados locais para gerenciar o carregamento e os dados da fatura para o formulário
  const [initialInvoiceData, setInitialInvoiceData] =
    useState<Partial<InvoiceFormValues> | null>(null);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(true); // Estado de carregamento para a busca inicial da fatura
  const [fetchInvoiceError, setFetchInvoiceError] = useState<string | null>(
    null
  ); // Estado de erro para a busca inicial da fatura

  // Estado para armazenar a lista de clientes formatada para o componente InvoiceForm
  const [clientListForForm, setClientListForForm] = useState<
    { id: number; name: string }[]
  >([]);
  // Estado para controlar erros na busca de clientes
  const [fetchingClientsError, setFetchingClientsError] = useState<
    string | null
  >(null);

  // Efeito para buscar a fatura atual
  useEffect(() => {
    const fetchCurrentInvoice = async () => {
      if (!id) {
        setFetchInvoiceError("ID da fatura não fornecido na URL.");
        setIsFetchingInvoice(false);
        return;
      }

      setIsFetchingInvoice(true);
      setFetchInvoiceError(null); // Limpa erros anteriores de busca
      setInitialInvoiceData(null); // Limpa dados anteriores

      try {
        const invoice = await getInvoice(Number(id)); // Chama o getInvoice do hook
        if (invoice) {
          // Prepara os dados para o formulário, garantindo que booleanos e numéricos
          // sejam mapeados corretamente para o tipo InvoiceFormValues.
          // Note que o CNPJ do backend (int8) é tratado como string no frontend no hook useInvoice.
          // Para booleanos, garantimos que sejam boolean, caso venham como 0/1 ou null do backend.
          setInitialInvoiceData({
            fiscalCode: invoice.fiscalCode,
            clientId: invoice.clientId
              ? Number.parseInt(invoice.clientId)
              : undefined, // Pode ser undefined se não houver cliente
            invoceValue: invoice.invoceValue,
            hasItem: invoice.hasItem ?? false, // Padrão false se null/undefined
            hasCreditcard: invoice.hasCreditcard ?? false,
            hasPartnerCode: invoice.hasPartnerCode ?? false,
            pdv: invoice.pdv ? Number.parseInt(invoice.pdv) : undefined,
            store: invoice.store ? Number.parseInt(invoice.store) : undefined,
            numCoupon: invoice.numCoupon ?? undefined,
            cnpj: invoice.cnpj || "", // Garante string vazia se null
            creditcard: invoice.creditcard || "", // Garante string vazia se null
          });
        } else {
          setFetchInvoiceError(
            "Fatura não encontrada ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar fatura:", err);
        setFetchInvoiceError(
          "Falha ao carregar os dados da fatura. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingInvoice(false);
      }
    };

    fetchCurrentInvoice();
  }, [id]); // Adiciona getInvoice nas dependências para ESLint

  // Efeito para carregar a lista de clientes quando o componente é montado
  useEffect(() => {
    const loadClientsForDropdown = async () => {
      setFetchingClientsError(null);
      try {
        await fetchClients({ limit: 9999 }); // Busca um limite alto para popular o dropdown
      } catch (err) {
        console.error(
          "Falha ao carregar lista de clientes para o formulário:",
          err
        );
        setFetchingClientsError(
          "Não foi possível carregar a lista de clientes. Verifique sua conexão ou tente novamente."
        );
        toast.error("Erro ao carregar clientes para o formulário.");
      }
    };
    loadClientsForDropdown();
  }, []);

  // Efeito para mapear a lista de clientes do hook para o formato esperado pelo formulário
  useEffect(() => {
    if (allClientsFromHook && allClientsFromHook.length > 0) {
      setClientListForForm(
        allClientsFromHook.map((client) => ({
          id: client.id,
          name: client.name,
        }))
      );
    } else if (!isFetchingClients && !fetchingClientsError) {
      setClientListForForm([]);
    }
  }, [allClientsFromHook, isFetchingClients, fetchingClientsError]);

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: InvoiceFormValues) => {
      if (!id) {
        toast.error("Não foi possível atualizar: ID da fatura não encontrado.");
        return;
      }

      // IMPORTANTE: A função `updateInvoice` não está implementada no `useInvoice`
      // porque a rota `PUT /invoices/:id` está comentada no seu backend (`invoiceRoutes.txt`).
      // Para que a atualização funcione, você precisará:
      // 1. Descomentar e implementar a rota PUT no seu backend.
      // 2. Criar a função `updateInvoice` dentro do `useInvoice` (similar a `updateClient`).
      // 3. Descomentar a chamada `updateInvoice(Number(id), data)` abaixo.

      // Exemplo de como a chamada de atualização seria:
      // const updatedInvoice = await updateInvoice(Number(id), data);
      // if (updatedInvoice) {
      //   toast.success("Fatura atualizada com sucesso!");
      //   navigate("/invoices");
      // } else {
      //   // O erro já seria tratado e notificado pelo useInvoice
      // }

      // MENSAGEM TEMPORÁRIA:
      console.log("Dados para atualização (requer backend ativo):", data);
      toast.error(
        "A funcionalidade de atualização de faturas está desabilitada. Habilite a rota PUT no backend para que esta ação funcione."
      );
      // Apenas para simular o comportamento de sucesso após ver a mensagem
      // remove essa linha quando o backend for implementado:
      // navigate("/invoices"); // Remova esta linha ao implementar o backend
    },
    [id, /* updateInvoice, */ navigate]
  ); // Dependências: id, navigate, e updateInvoice (quando habilitado)

  // Determina se o formulário deve estar desabilitado enquanto dados são carregados
  const isFormDisabled =
    isFetchingInvoice || isFetchingClients || isUpdatingInvoice;

  // Exibição de estado de carregamento inicial da fatura
  if (isFetchingInvoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">Carregando dados da fatura...</p>
      </div>
    );
  }

  // Exibição de erro na busca inicial da fatura
  if (fetchInvoiceError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar fatura
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchInvoiceError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/invoices")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de faturas
        </button>
      </div>
    );
  }

  // Se initialInvoiceData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialInvoiceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Fatura não encontrada
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhuma fatura.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/invoices")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de faturas
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
          onClick={() => navigate("/invoices")}
          disabled={isFormDisabled} // Desabilita durante carregamento
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Atualizar Fatura</h1>
      </div>

      {/* Exibição de Erros ao carregar clientes */}
      {fetchingClientsError && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm break-words">{fetchingClientsError}</p>
        </div>
      )}

      {/* Exibição de carregamento da lista de clientes */}
      {isFetchingClients && !fetchingClientsError && (
        <div className="flex justify-center items-center h-24">
          <Loader className="w-6 h-6 animate-spin text-primary-500 mr-2" />
          <p className="text-md text-gray-700">
            Carregando lista de clientes...
          </p>
        </div>
      )}

      {/* Formulário de Atualização */}
      <InvoiceForm
        initialValues={initialInvoiceData} // Passa os dados da fatura carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingInvoice} // Passa o estado de carregamento da atualização
        clients={clientListForForm} // Passa a lista de clientes para o formulário
      />
    </div>
  );
}
