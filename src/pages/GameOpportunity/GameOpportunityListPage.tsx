// src/pages/GameOpportunityListPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import useGameOpportunity from "../../hooks/useGameOpportunity"; // Ajuste o caminho conforme sua estrutura de pastas
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  Trash2,
  FileText, // Ícone para "Ver Fatura"
  Plus,
  Download,
  XCircle,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import ExportModal from "../../components/ExportModal"; // Assumindo que este modal é genérico e reutilizável

export default function GameOpportunityListPage() {
  // Desestrutura o hook que criamos anteriormente para acessar os dados e funções
  const {
    gameOpportunities,
    fetchGameOpportunities,
    deleteGameOpportunity,
    exportGameOpportunities,
    isLoading,
    error,
    totalEntities,
    currentPage,
    totalPages,
  } = useGameOpportunity();

  // Log para depuração, similar ao ClientListPage
  console.log("gameOpportunities", {
    gameOpportunities,
    isLoading,
    error,
    totalEntities,
    currentPage,
    totalPages,
  });

  const navigate = useNavigate();

  // Estados para os valores dos inputs de filtro (ainda não aplicados à busca)
  const [filterInputs, setFilterInputs] = useState({
    gift: "", // Filtrar pelo presente (string)
    active: "", // Filtrar por status (boolean, mas 'true'/'false'/'', para o select)
    invoiceId: "", // Filtrar por ID da Fatura (número, mas tratado como string no input)
    startDate: "", // Data inicial de criação (YYYY-MM-DD)
    endDate: "", // Data final de criação (YYYY-MM-DD)
  });

  // Estados para os filtros que foram efetivamente aplicados à busca (enviados para a API)
  const [appliedFilters, setAppliedFilters] = useState({
    gift: "",
    active: "",
    invoiceId: "",
    startDate: "",
    endDate: "",
  });

  // Estados para controle de paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Estado para controlar o modal de confirmação de exclusão
  const [deletingGameOpportunity, setDeletingGameOpportunity] = useState<
    number | null
  >(null);

  // Estado para controlar a abertura do modal de exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /**
   * Efeito React para buscar as oportunidades de jogo sempre que os filtros aplicados
   * ou os parâmetros de paginação mudam.
   */
  useEffect(() => {
    fetchGameOpportunities({
      ...appliedFilters, // Utiliza os filtros que foram *aplicados*
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [appliedFilters, pagination.page, pagination.limit]); // Adicionado fetchGameOpportunities como dependência

  /**
   * Efeito React para carregar os dados iniciais na primeira renderização do componente.
   */
  useEffect(() => {
    fetchGameOpportunities({
      page: 1,
      limit: 10,
    });
  }, []); // O array vazio assegura que este efeito rode apenas uma vez

  /**
   * Callback para lidar com a mudança nos inputs de filtro.
   * Atualiza o estado `filterInputs` sem disparar uma nova busca imediatamente.
   */
  const handleFilterInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilterInputs((prevInputs) => ({
        ...prevInputs,
        [name]: value,
      }));
    },
    []
  );

  /**
   * Callback para aplicar os filtros.
   * Copia os valores de `filterInputs` para `appliedFilters` e reinicia a paginação para a primeira página.
   * Isso dispara o `useEffect` que faz a chamada à API.
   */
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filterInputs }); // Aplica os filtros
    setPagination((prev) => ({ ...prev, page: 1 })); // Reinicia para a primeira página
  }, [filterInputs]);

  /**
   * Callback para limpar todos os filtros.
   * Reseta `filterInputs` e `appliedFilters` para valores vazios e reinicia a paginação.
   */
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      gift: "",
      active: "",
      invoiceId: "",
      startDate: "",
      endDate: "",
    };
    setFilterInputs(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Callback para aplicar os filtros ao pressionar a tecla "Enter" em qualquer campo de filtro.
   */
  const handleFilterKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleApplyFilters();
      }
    },
    [handleApplyFilters]
  );

  /**
   * Callback para lidar com a mudança de página da paginação.
   * Verifica se a nova página é válida antes de atualizar o estado.
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPagination((prev) => ({ ...prev, page: newPage }));
      }
    },
    [totalPages]
  );

  /**
   * Callback para lidar com a mudança do limite de itens exibidos por página.
   * Ao mudar o limite, a paginação é reiniciada para a primeira página.
   */
  const handleLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPagination({
        limit: Number(e.target.value),
        page: 1, // Volta para a primeira página ao mudar o limite
      });
    },
    []
  );

  /**
   * Função assíncrona para lidar com a exclusão de uma oportunidade de jogo.
   * Após a exclusão, verifica se a página atual ficaria vazia e ajusta a paginação,
   * ou simplesmente refaz a busca na página atual.
   */
  const handleDelete = async () => {
    if (deletingGameOpportunity) {
      const success = await deleteGameOpportunity(deletingGameOpportunity);
      if (success) {
        // Se a exclusão fez com que a última entidade da página fosse removida
        // e não estamos na primeira página, volta para a página anterior.
        if (gameOpportunities.length === 1 && currentPage > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Caso contrário, apenas refaz a busca na página atual com os filtros.
          fetchGameOpportunities({
            ...appliedFilters,
            page: currentPage,
            limit: pagination.limit,
          });
        }
      }
      setDeletingGameOpportunity(null); // Fecha o modal de confirmação
    }
  };

  /**
   * Callback para lidar com a exportação de dados.
   * Combina os filtros aplicados com os parâmetros de data e formato vindos do ExportModal.
   */
  const handleExport = useCallback(
    async (exportParams: {
      startDate?: string;
      endDate?: string;
      format?: "csv" | "xlsx" | "pdf";
    }) => {
      const combinedParams = {
        ...appliedFilters, // Inclui os filtros de busca atuais
        startDate: exportParams.startDate,
        endDate: exportParams.endDate,
        format: exportParams.format || "csv", // Type assertion para garantir o tipo correto
      };
      return await exportGameOpportunities(combinedParams);
    },
    [exportGameOpportunities, appliedFilters]
  );

  /**
   * Memoiza a verificação de filtros aplicados para exibir um indicador visual.
   */
  const hasAppliedFilters = useMemo(() => {
    // Verifica se qualquer valor nos filtros aplicados não é vazio/nulo
    return Object.values(appliedFilters).some((value) => value.trim() !== "");
  }, [appliedFilters]);

  /**
   * Memoiza a verificação de alterações não aplicadas nos inputs de filtro.
   */
  const hasUnappliedChanges = useMemo(() => {
    // Compara o JSON dos inputs de filtro com o JSON dos filtros aplicados
    return JSON.stringify(filterInputs) !== JSON.stringify(appliedFilters);
  }, [filterInputs, appliedFilters]);

  /**
   * Memoiza a renderização de linhas de esqueleto para o estado de carregamento.
   */
  const renderSkeletonRows = useMemo(() => {
    if (!isLoading) return null;
    return Array.from({ length: pagination.limit }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
      </tr>
    ));
  }, [isLoading, pagination.limit]);

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="page-title mb-4 sm:mb-0">
          Lista de Oportunidades de Jogo
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Botão para Exportar Oportunidades de Jogo */}
          <button
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => setIsExportModalOpen(true)}
            disabled={isLoading}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Exibição de Erros da API */}
      {error && (
        <div className="alert alert-error flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm break-words">{error}</p>
        </div>
      )}

      {/* Seção de Filtros */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="card-title">Filtrar Oportunidades de Jogo</h2>
            {/* Indicador visual de filtros ativos */}
            {hasAppliedFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtros ativos
              </span>
            )}
          </div>
          {/* Indicador visual de alterações não aplicadas */}
          {hasUnappliedChanges && (
            <span className="text-xs text-amber-600 font-medium">
              Alterações não aplicadas
            </span>
          )}
        </div>
        {/* Corpo do card de filtros com os campos de input */}
        <div className="card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            className="form-input"
            placeholder="Filtrar Presente"
            name="gift"
            value={filterInputs.gift}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filtrar ID da Fatura"
            name="invoiceId"
            value={filterInputs.invoiceId}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <select
            className="form-select"
            name="active"
            value={filterInputs.active}
            onChange={handleFilterInputChange}
          >
            <option value="">Status (Todos)</option>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </div>
        {/* Rodapé do card de filtros com informações e botões de ação */}
        <div className="card-footer flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="text-sm text-gray-600">
            {hasAppliedFilters ? (
              <span>
                Filtros aplicados:{" "}
                {Object.entries(appliedFilters)
                  .filter(([_, value]) => value.trim() !== "")
                  .map(([key, value]) => {
                    // Formata a exibição do filtro 'active'
                    if (key === "active") {
                      return `Status: "${
                        value === "true" ? "Ativa" : "Inativa"
                      }"`;
                    }
                    // Formata datas
                    if (key === "startDate" || key === "endDate") {
                      return `${
                        key === "startDate" ? "De" : "Até"
                      }: "${new Date(value).toLocaleDateString("pt-BR")}"`;
                    }
                    return `${key}: "${value}"`;
                  })
                  .join(", ")}
              </span>
            ) : (
              <span>Nenhum filtro aplicado</span>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              className="btn btn-ghost"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              <Search className="w-4 h-4 mr-1" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Oportunidades de Jogo */}
      <div className="card table-container">
        <div className="card-body p-0">
          <table className="table data-table">
            <thead>
              <tr>
                <th className="w-10">ID</th>
                <th>Presente</th>
                <th>Status</th>
                <th>Fatura ID</th>
                <th>Cód. Fiscal Fatura</th> {/* Campo do JOIN */}
                <th>Cliente Fatura</th> {/* Campo do JOIN */}
                <th>Criado Em</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Renderiza linhas de esqueleto se estiver carregando */}
              {isLoading && renderSkeletonRows}
              {/* Mensagem se não houver dados e não estiver carregando */}
              {!isLoading && gameOpportunities.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    {hasAppliedFilters
                      ? "Nenhuma oportunidade de jogo encontrada com os filtros aplicados."
                      : "Nenhuma oportunidade de jogo cadastrada."}
                  </td>
                </tr>
              )}
              {/* Renderiza as linhas de dados se não estiver carregando e houver dados */}
              {!isLoading &&
                gameOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="table-row">
                    <td>{opportunity.id}</td>
                    <td>{opportunity.gift || "-"}</td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          opportunity.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {opportunity.active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td>{opportunity.invoiceId || "-"}</td>
                    <td>{opportunity.fiscalCode || "-"}</td>{" "}
                    {/* Exibe o código fiscal da fatura */}
                    <td>{opportunity.clientName || "-"}</td>{" "}
                    {/* Exibe o nome do cliente da fatura */}
                    <td>
                      {opportunity.createdAt
                        ? new Date(opportunity.createdAt).toLocaleDateString(
                            "pt-BR"
                          )
                        : "-"}
                    </td>
                    <td className="flex items-center justify-center space-x-2">
                      {/* Botão para ver Detalhes da Oportunidade */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(`/game-opportunities/${opportunity.id}`)
                        }
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Botão para Deletar Oportunidade */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setDeletingGameOpportunity(opportunity.id)
                        }
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de Paginação */}
      {!isLoading && totalEntities > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando{" "}
            {Math.min(totalEntities, (currentPage - 1) * pagination.limit + 1)}{" "}
            - {Math.min(totalEntities, currentPage * pagination.limit)} de{" "}
            {totalEntities} oportunidades de jogo
          </div>
          <div className="flex items-center space-x-4">
            {/* Seleção de Limite por Página */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="limit-select"
                className="text-sm text-gray-600 hidden sm:block"
              >
                Itens por página:
              </label>
              <select
                id="limit-select"
                className="form-select form-input-sm"
                value={pagination.limit}
                onChange={handleLimitChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Botões de Navegação de Página */}
            <nav className="flex space-x-2" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Anterior</span>
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-300 flex items-center justify-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                <span className="mr-1 hidden sm:inline">Próxima</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Exclusão */}
      {deletingGameOpportunity && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir a oportunidade de jogo de ID{" "}
                <strong>{deletingGameOpportunity}</strong>? Essa ação não pode
                ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingGameOpportunity(null)}
                disabled={isLoading}
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
      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isLoading}
        title="Exportar Oportunidades de Jogo"
        currentFilters={appliedFilters} // Passa os filtros atuais para o modal, se ele precisar exibir ou pré-preencher
        entityName="oportunidades de jogo"
      />
    </div>
  );
}
