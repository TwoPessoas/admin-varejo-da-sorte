// src/pages/InvoiceCreatePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import useInvoice from "../../hooks/useInvoice";
import useClient from "../../hooks/useClient";
import type { InvoiceFormValues } from "./components/InvoiceForm";
import InvoiceForm from "./components/InvoiceForm";

export default function InvoiceCreatePage() {
  // Hook para operações de criação de fatura
  const { createInvoice, isLoading: isCreatingInvoice } = useInvoice();

  // Hook para buscar a lista de clientes (necessário para o select de cliente no formulário)
  // Assumimos que fetchClients pode ser usado para buscar uma quantidade grande de clientes
  // para o propósito do select. Se a lista de clientes for muito grande,
  // talvez seja necessário otimizar a busca ou implementar um autocomplete no futuro.
  const {
    fetchClients,
    clients: allClientsFromHook,
    isLoading: isFetchingClients,
  } = useClient();

  const navigate = useNavigate();

  // Estado para armazenar a lista de clientes formatada para o componente InvoiceForm
  const [clientListForForm, setClientListForForm] = useState<
    { id: number; name: string }[]
  >([]);
  // Estado para controlar erros na busca de clientes
  const [fetchingClientsError, setFetchingClientsError] = useState<
    string | null
  >(null);

  // Efeito para carregar a lista de clientes quando o componente é montado
  useEffect(() => {
    const loadClientsForDropdown = async () => {
      setFetchingClientsError(null); // Limpa qualquer erro anterior
      try {
        // Tenta buscar um número grande de clientes.
        // Em um cenário de produção com muitos clientes, seria ideal ter um endpoint
        // específico para buscar todos os clientes sem paginação ou com lazy loading/autocomplete.
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
  }, []); // Dependência em fetchClients garante que seja chamado quando o hook está pronto

  // Efeito para mapear a lista de clientes do hook (allClientsFromHook) para o formato esperado pelo formulário
  useEffect(() => {
    if (allClientsFromHook && allClientsFromHook.length > 0) {
      setClientListForForm(
        allClientsFromHook.map((client) => ({
          id: client.id,
          name: client.name,
        }))
      );
    } else if (!isFetchingClients && !fetchingClientsError) {
      // Se não está carregando, não há erro, e a lista está vazia, pode significar que não há clientes cadastrados.
      // O formulário ainda pode ser renderizado, mas o select de cliente estará vazio.
      setClientListForForm([]);
    }
  }, [allClientsFromHook, isFetchingClients, fetchingClientsError]); // Depende da lista de clientes do hook e do estado de carregamento/erro

  /**
   * Lida com a submissão do formulário de criação de fatura.
   * @param data Os dados do formulário (fiscalCode e clientId).
   */
  const handleCreate = async (data: InvoiceFormValues) => {
    try {
      // A função `createInvoice` no hook espera apenas `fiscalCode` e `clientId`.
      // Extraímos esses campos do objeto `data` completo do formulário.
      const newInvoicePayload = {
        fiscalCode: data.fiscalCode,
        clientId: data.clientId.toString(),
      };

      // Chama a função createInvoice do nosso hook
      const result = await createInvoice(newInvoicePayload);

      // Se a fatura foi criada com sucesso (o hook retorna um objeto ou null em caso de erro já tratado)
      if (result) {
        navigate("/invoices"); // Redireciona para a listagem de faturas
      } else {
        // Se `result` for null, o erro já foi tratado e notificado via `toast.error`
        // dentro do `useInvoice`, então não precisamos de toast duplicado aqui.
      }
    } catch (err: any) {
      console.error("Erro inesperado ao criar fatura:", err);
      // Fallback para erros que não foram capturados pelo hook `useInvoice`
      toast.error(
        "Erro inesperado ao criar fatura. Tente novamente mais tarde."
      );
    }
  };

  // Determina se o formulário deve estar desabilitado (enquanto busca clientes ou cria fatura)
  const isFormDisabled = isFetchingClients || isCreatingInvoice;

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/invoices")}
          disabled={isFormDisabled} // Desabilita o botão "Voltar" durante o carregamento ou criação
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Nova Fatura</h1>
      </div>

      {/* Exibição de Erros ao carregar clientes */}
      {fetchingClientsError && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm break-words">{fetchingClientsError}</p>
        </div>
      )}

      {/* Renderiza o formulário ou uma mensagem de carregamento */}
      {isFetchingClients && !fetchingClientsError ? (
        <div className="flex justify-center items-center h-48">
          <Loader className="w-8 h-8 animate-spin text-primary-500 mr-2" />
          <p className="text-lg text-gray-700">
            Carregando lista de clientes...
          </p>
        </div>
      ) : (
        <InvoiceForm
          onSubmit={handleCreate}
          isLoading={isCreatingInvoice} // Passa o estado de carregamento da criação de fatura
          clients={clientListForForm} // Passa a lista de clientes para o formulário
        />
      )}
    </div>
  );
}
