// src/pages/InvoiceDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  Trash2,
  XCircle,
  CheckCircle,
  User, // Para linkar com o detalhe do cliente
} from "lucide-react";
import useInvoice, { type Invoice } from "../../hooks/useInvoice";
import DateUtils from "../../utils/DateUtils";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da fatura da URL
  // 'isDeleting' é o estado de carregamento do hook useInvoice para operações de delete.
  // Renomeamos para evitar conflito com 'isFetchingInvoice' (carregamento inicial da página).
  const { getInvoice, deleteInvoice, isLoading: isDeleting } = useInvoice();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(true); // Estado para o carregamento inicial da fatura
  const [fetchInvoiceError, setFetchInvoiceError] = useState<string | null>(
    null
  ); // Estado para erros durante o carregamento inicial da fatura
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<number | null>(
    null
  ); // Estado para controlar o modal de exclusão (guarda o ID da fatura a ser excluída)
  const navigate = useNavigate();

  // Efeito para buscar os dados da fatura quando o componente é montado ou o ID muda
  useEffect(() => {
    const fetchInvoice = async () => {
      // Verifica se o ID foi fornecido na URL
      if (!id) {
        setFetchInvoiceError("ID da fatura não fornecido na URL.");
        setIsFetchingInvoice(false);
        return;
      }

      setIsFetchingInvoice(true); // Inicia o estado de carregamento
      setFetchInvoiceError(null); // Limpa erros anteriores
      setInvoice(null); // Limpa dados de fatura anteriores, se houver

      try {
        // Chama a função getInvoice do nosso hook, convertendo o ID para número
        const data = await getInvoice(Number(id));
        if (data) {
          setInvoice(data); // Define os dados da fatura se a busca for bem-sucedida
        } else {
          // Caso a fatura não seja encontrada (retorno null do backend ou erro genérico)
          setFetchInvoiceError(
            "Fatura não encontrada ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        // Captura e loga erros da requisição
        console.error("Falha ao buscar fatura:", err);
        setFetchInvoiceError(
          "Falha ao carregar os detalhes da fatura. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingInvoice(false); // Finaliza o estado de carregamento, independente do sucesso ou erro
      }
    };

    fetchInvoice();
  }, [id]); // Dependências: id da URL e a função getInvoice (do hook)

  // Lida com a exclusão da fatura, chamada quando o modal de confirmação é aceito
  const handleDelete = useCallback(async () => {
    if (invoice && invoice.id) {
      // Chama a função deleteInvoice do nosso hook
      const success = await deleteInvoice(invoice.id);
      if (success) {
        navigate("/invoices"); // Se a exclusão for bem-sucedida, redireciona para a lista de faturas
      }
      setDeletingInvoiceId(null); // Fecha o modal de confirmação de exclusão
    }
  }, [invoice, deleteInvoice, navigate]); // Dependências: objeto invoice, função deleteInvoice e navigate

  // Função utilitária para formatar valores monetários (ex: R\$ 1.234,56)
  const formatValue = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  // Função utilitária para formatar valores booleanos (Sim/Não com ícones)
  const formatBoolean = useCallback((value: boolean | undefined | null) => {
    if (value === true) {
      return (
        <span className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" /> Sim
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-500">
        <XCircle className="w-4 h-4 mr-1" /> Não
      </span>
    );
  }, []);

  // Função utilitária para formatar CNPJ (XX.XXX.XXX/YYYY-ZZ)
  const formatCnpj = useCallback((cnpj: string | null) => {
    if (!cnpj) return "Não informado";
    // Remove qualquer caractere não numérico
    const cleaned = cnpj.replace(/\D/g, "");
    // Aplica a máscara se o CNPJ tiver 14 dígitos
    if (cleaned.length === 14) {
      return cleaned.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj; // Retorna o valor original se não for um CNPJ de 14 dígitos
  }, []);

  // Exibe um spinner de carregamento enquanto a fatura está sendo buscada
  if (isFetchingInvoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes da fatura...
        </p>
      </div>
    );
  }

  // Exibe uma mensagem de erro se a busca inicial falhar
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

  // Exibe uma mensagem se a fatura não for encontrada após a busca
  if (!invoice) {
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

  // Renderiza os detalhes da fatura se tudo estiver OK
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <button
          className="btn btn-secondary mb-4 sm:mb-0" // Adicionado margem para mobile
          onClick={() => navigate("/invoices")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes da Fatura</h1>
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          {/* Botão Editar - Comentado pois a rota PUT para invoices está comentada no backend (invoiceRoutes.txt) */}
          {/* Se a funcionalidade de edição for ativada no backend, descomente este botão */}
          {/* <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button> */}
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingInvoiceId(invoice.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Cartão de Informações da Fatura */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Fatura: {invoice.fiscalCode || "N/A"}</h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {invoice.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados Principais da Fatura */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Dados da Fatura
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Código Fiscal</h4>
            <p className="text-gray-800">
              {invoice.fiscalCode || "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Valor da Fatura
            </h4>
            <p className="text-gray-800">{formatValue(invoice.invoceValue)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">CNPJ</h4>
            <p className="text-gray-800">{formatCnpj(invoice.cnpj)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">PDV</h4>
            <p className="text-gray-800">{invoice.pdv || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Loja</h4>
            <p className="text-gray-800">{invoice.store || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Número do Cupom
            </h4>
            <p className="text-gray-800">
              {invoice.numCoupon || "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Cartão de Crédito
            </h4>
            <p className="text-gray-800">
              {invoice.creditcard || "Não informado"}
              {/* Nota: Se 'creditcard' for um JSON de bandeiras de cartão (ex: "{'Visa', 'Mastercard'}"), 
                  seria necessário um parser aqui para exibir as bandeiras de forma amigável. */}
            </p>
          </div>

          {/* Status da Fatura (Flags Booleanas) */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Status da Fatura
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Possui Item</h4>
            <p className="text-gray-800">{formatBoolean(invoice.hasItem)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Possui Cartão de Crédito
            </h4>
            <p className="text-gray-800">
              {formatBoolean(invoice.hasCreditcard)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Possui Código de Parceiro
            </h4>
            <p className="text-gray-800">
              {formatBoolean(invoice.hasPartnerCode)}
            </p>
          </div>

          {/* Informações do Cliente Relacionado */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Cliente Relacionado
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">ID do Cliente</h4>
            <p className="text-gray-800 flex items-center">
              {invoice.clientId || "Não informado"}
              {invoice.clientId && (
                <button
                  className="btn btn-info btn-sm ml-2"
                  onClick={() => navigate(`/clients/${invoice.clientId}`)}
                  title="Ver Detalhes do Cliente"
                >
                  <User className="w-4 h-4 mr-1" />
                  Ver Cliente
                </button>
              )}
            </p>
          </div>
          {/* Nota: clientName, clientCpf, clientEmail não são retornados pela função getInvoice 
              no backend (apenas na listagem getAllInvoicesWithClientName). 
              A navegação para o detalhe do cliente via botão "Ver Cliente" já supre essa necessidade. */}

          {/* Dados do Sistema */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700">
              Informações do Sistema
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Criado em</h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(invoice.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(invoice.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão */}
      <ConfirmationModal
        isOpen={deletingInvoiceId !== null}
        onClose={() => setDeletingInvoiceId(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a fatura ${
          invoice.fiscalCode || "sem código fiscal"
        } (ID: ${deletingInvoiceId})? Essa ação não pode ser desfeita!`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonClass="btn-danger"
        isProcessing={isDeleting} // O estado 'isDeleting' do hook controla o loading do modal
      />
    </div>
  );
}
