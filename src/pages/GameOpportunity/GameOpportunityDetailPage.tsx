// src/pages/GameOpportunityDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader,
  ArrowLeft,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
  FileText, // Ícone para ver detalhes da fatura
} from "lucide-react";
import useGameOpportunity from "../../hooks/useGameOpportunity"; // Ajuste o caminho conforme sua estrutura
import DateUtils from "../../utils/DateUtils"; // Assumindo DateUtils existe

// Definindo a interface GameOpportunity diretamente aqui para clareza
// Ou você pode importar do seu arquivo de tipos ou do hook se for exportada
interface GameOpportunity {
  id: number;
  gift: string | null;
  active: boolean;
  usedAt: string | null; // timestamptz
  invoiceId: number | null; // int8
  createdAt: string;
  updatedAt: string;
}

export default function GameOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>(); // Captura o ID da URL
  const { getGameOpportunity, deleteGameOpportunity, isLoading } =
    useGameOpportunity(); // isLoading aqui é para deleteGameOpportunity
  const [gameOpportunity, setGameOpportunity] =
    useState<GameOpportunity | null>(null);
  const [isFetchingOpportunity, setIsFetchingOpportunity] = useState(true); // Para o carregamento inicial dos detalhes
  const [fetchOpportunityError, setFetchOpportunityError] = useState<
    string | null
  >(null); // Para erros no carregamento inicial
  const [deletingOpportunity, setDeletingOpportunity] = useState<number | null>(
    null
  ); // Para o modal de exclusão
  const navigate = useNavigate();

  /**
   * Efeito para buscar os dados da oportunidade de jogo quando o ID na URL muda.
   */
  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!id) {
        setFetchOpportunityError(
          "ID da oportunidade de jogo não fornecido na URL."
        );
        setIsFetchingOpportunity(false);
        return;
      }

      setIsFetchingOpportunity(true);
      setFetchOpportunityError(null);
      setGameOpportunity(null); // Limpa dados anteriores

      try {
        const data = await getGameOpportunity(Number(id));
        if (data) {
          setGameOpportunity(data);
        } else {
          setFetchOpportunityError(
            "Oportunidade de jogo não encontrada ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Falha ao buscar oportunidade de jogo:", err);
        setFetchOpportunityError(
          "Falha ao carregar os detalhes da oportunidade de jogo. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingOpportunity(false);
      }
    };

    fetchOpportunity();
  }, [id, getGameOpportunity]); // Adiciona getGameOpportunity nas dependências para ESLint

  /**
   * Callback para lidar com a exclusão da oportunidade de jogo.
   * Redireciona para a lista após a exclusão bem-sucedida.
   */
  const handleDelete = useCallback(async () => {
    if (gameOpportunity && gameOpportunity.id) {
      // O useGameOpportunity já dispara toast de sucesso/erro
      const success = await deleteGameOpportunity(gameOpportunity.id);
      if (success) {
        navigate("/game-opportunities"); // Redireciona para a lista após a exclusão
      }
      setDeletingOpportunity(null); // Fecha o modal
    }
  }, [gameOpportunity, deleteGameOpportunity, navigate]);

  // --- Renderização Condicional de Estados ---

  // Estado de Carregamento Inicial
  if (isFetchingOpportunity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes da oportunidade de jogo...
        </p>
      </div>
    );
  }

  // Estado de Erro no Carregamento Inicial
  if (fetchOpportunityError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar oportunidade de jogo
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {fetchOpportunityError}
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/game-opportunities")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de oportunidades
        </button>
      </div>
    );
  }

  // Estado de Oportunidade Não Encontrada (após fetch bem-sucedido, mas sem dados)
  if (!gameOpportunity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Oportunidade de jogo não encontrada
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhuma oportunidade de jogo.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/game-opportunities")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de oportunidades
        </button>
      </div>
    );
  }

  // --- Renderização dos Detalhes da Oportunidade de Jogo ---
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <button
          className="btn btn-secondary mb-4 sm:mb-0" // Adicionado margem para mobile
          onClick={() => navigate("/game-opportunities")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes da Oportunidade de Jogo</h1>
        {/* Ações: Ver Fatura, Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          {/* Botão para ver a Fatura associada */}
          <button
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() =>
              gameOpportunity.invoiceId
                ? navigate(`/invoices/${gameOpportunity.invoiceId}`) // Adapte a rota para sua página de detalhes de fatura
                : null
            }
            disabled={!gameOpportunity.invoiceId} // Desabilita se não houver ID da fatura
          >
            <FileText className="w-5 h-5 mr-2" />
            Ver Fatura
          </button>
          {/* Botão de Edição */}
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() =>
              navigate(`/game-opportunities/${gameOpportunity.id}/edit`)
            }
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          {/* Botão de Exclusão */}
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingOpportunity(gameOpportunity.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações da Oportunidade de Jogo */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {gameOpportunity.gift || "Oportunidade Sem Presente"}
          </h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {gameOpportunity.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados Principais */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Dados Principais
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Presente</h4>
            <p className="text-gray-800">
              {gameOpportunity.gift || "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Fatura ID</h4>
            <p className="text-gray-800">
              {gameOpportunity.invoiceId || "Não associada"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Usado Em</h4>
            <p className="text-gray-800">
              {gameOpportunity.usedAt
                ? DateUtils.toDateTimePtBr(gameOpportunity.usedAt)
                : "Não usado"}
            </p>
          </div>

          {/* Status da Oportunidade */}
          <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Status</h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Ativa</h4>
            <p
              className={`text-sm font-medium flex items-center ${
                gameOpportunity.active ? "text-green-600" : "text-red-600"
              }`}
            >
              {gameOpportunity.active ? (
                <CheckCircle className="w-4 h-4 mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              {gameOpportunity.active ? "Sim" : "Não"}
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
              {DateUtils.toDateTimePtBr(gameOpportunity.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(gameOpportunity.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão (Reutilizado da ClientListPage) */}
      {deletingOpportunity && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir a oportunidade de jogo{" "}
                <strong>
                  {gameOpportunity.gift || "Sem Presente"} (ID:{" "}
                  {deletingOpportunity})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingOpportunity(null)}
                disabled={isLoading} // isLoading do useGameOpportunity para a operação de delete
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
