// src/pages/DrawNumberDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  FileText, // Ícone para "Ver Fatura"
} from "lucide-react";
import useDrawNumber from "../../hooks/useDrawNumber";
import DateUtils from "../../utils/DateUtils";

// Interface para um único número da sorte (replicada para clareza, mas idealmente importada do hook)
interface DrawNumber {
  id: number;
  number: number;
  active: boolean;
  winnerAt: string | null;
  emailSendedAt: string | null;
  invoiceId: number;
  createdAt: string;
  updatedAt: string;
  fiscalCode?: string; // Campo do JOIN
  clientName?: string; // Campo do JOIN
}

export default function DrawNumberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getDrawNumber,
    deleteDrawNumber,
    isLoading: isDeleting,
  } = useDrawNumber(); // isLoading renomeado para isDeleting
  const [drawNumber, setDrawNumber] = useState<DrawNumber | null>(null);
  const [isFetchingDrawNumber, setIsFetchingDrawNumber] = useState(true); // Para o carregamento inicial do detalhe
  const [fetchDrawNumberError, setFetchDrawNumberError] = useState<
    string | null
  >(null); // Para erros no carregamento inicial
  const [deletingDrawNumberId, setDeletingDrawNumberId] = useState<
    number | null
  >(null); // Para o modal de exclusão
  const navigate = useNavigate();

  // Efeito para buscar os dados do número da sorte
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setFetchDrawNumberError("ID do número da sorte não fornecido na URL.");
        setIsFetchingDrawNumber(false);
        return;
      }

      setIsFetchingDrawNumber(true);
      setFetchDrawNumberError(null);
      setDrawNumber(null); // Limpa dados anteriores

      try {
        const data = await getDrawNumber(Number(id));
        if (data) {
          setDrawNumber(data);
        } else {
          setFetchDrawNumberError(
            "Número da sorte não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch draw number:", err);
        setFetchDrawNumberError(
          "Falha ao carregar os detalhes do número da sorte. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingDrawNumber(false);
      }
    };

    fetchDetail();
  }, [id]); // Adiciona getDrawNumber nas dependências para ESLint

  // Lida com a exclusão do número da sorte
  const handleDelete = useCallback(async () => {
    if (drawNumber && drawNumber.id) {
      const success = await deleteDrawNumber(drawNumber.id); // O useDrawNumber já dispara toast de sucesso/erro
      if (success) {
        navigate("/draw-numbers"); // Redireciona para a lista após a exclusão
      }
      setDeletingDrawNumberId(null); // Fecha o modal
    }
  }, [drawNumber, deleteDrawNumber, navigate]);

  // Handle loading state for initial fetch
  if (isFetchingDrawNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes do número da sorte...
        </p>
      </div>
    );
  }

  // Handle error state for initial fetch
  if (fetchDrawNumberError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar número da sorte
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchDrawNumberError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/draw-numbers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de números da sorte
        </button>
      </div>
    );
  }

  // Handle no data state (drawNumber not found after successful fetch, or ID was missing)
  if (!drawNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Número da sorte não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum número da sorte.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/draw-numbers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de números da sorte
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
          onClick={() => navigate("/draw-numbers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Número da Sorte</h1>
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/draw-numbers/${drawNumber.id}/edit`)}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingDrawNumberId(drawNumber.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações do Número da Sorte */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Número: {drawNumber.number}</h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {drawNumber.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados Principais */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Dados do Número da Sorte
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Número</h4>
            <p className="text-gray-800">{drawNumber.number}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Ativo</h4>
            <p
              className={`text-sm font-medium flex items-center ${
                drawNumber.active ? "text-green-600" : "text-gray-500"
              }`}
            >
              {drawNumber.active ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {drawNumber.active ? "Sim" : "Não"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Ganhador em</h4>
            <p className="text-gray-800">
              {drawNumber.winnerAt
                ? DateUtils.toDateTimePtBr(drawNumber.winnerAt)
                : "Não definido"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Email Enviado Em
            </h4>
            <p className="text-gray-800">
              {drawNumber.emailSendedAt
                ? DateUtils.toDateTimePtBr(drawNumber.emailSendedAt)
                : "Não enviado"}
            </p>
          </div>

          {/* Informações da Fatura Associada */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              Fatura Associada
            </h4>
            <button
              className="btn btn-sm btn-info"
              onClick={() => navigate(`/invoices/${drawNumber.invoiceId}`)}
              title="Ver Detalhes da Fatura"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Fatura
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">ID Fatura</h4>
            <p className="text-gray-800">{drawNumber.invoiceId}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Código Fiscal Fatura
            </h4>
            <p className="text-gray-800">
              {drawNumber.fiscalCode || "Não disponível"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Nome do Cliente
            </h4>
            <p className="text-gray-800">
              {drawNumber.clientName || "Não disponível"}
            </p>
          </div>

          {/* Informações do Sistema */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Informações do Sistema
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Criado em</h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(drawNumber.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(drawNumber.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão */}
      {deletingDrawNumberId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o número da sorte{" "}
                <strong>
                  {drawNumber.number} (ID: {deletingDrawNumberId})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingDrawNumberId(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
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
