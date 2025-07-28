// src/pages/DrawNumberListPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Importar ícones do lucide-react
import {
  Edit,
  Eye,
  Trash2,
  Download,
  XCircle,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  X,
  FileText, // Usado para "Ver Fatura"
} from "lucide-react";
import useDrawNumber from "../../hooks/useDrawNumber";
import ExportModal from "../../components/ExportModal";

export default function DrawNumberListPage() {
  const {
    drawNumbers,
    fetchDrawNumbers,
    deleteDrawNumber,
    exportDrawNumbers,
    isLoading,
    error,
    totalEntities,
    currentPage,
    totalPages,
  } = useDrawNumber();

  const navigate = useNavigate();

  // Estados para filtros (valores dos inputs)
  const [filterInputs, setFilterInputs] = useState({
    invoiceId: "",
    number: "",
  });

  // Estados para filtros aplicados (valores que serão enviados para a API)
  const [appliedFilters, setAppliedFilters] = useState({
    invoiceId: "",
    number: "",
  });

  // Estados para paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Estado para controle do modal de exclusão
  const [deletingDrawNumberId, setDeletingDrawNumberId] = useState<
    number | null
  >(null);
  // Estado para controle da exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Efeito para buscar números da sorte quando os filtros aplicados ou a paginação mudam
  useEffect(() => {
    fetchDrawNumbers({
      ...appliedFilters, // Usa os filtros aplicados, não os inputs
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [appliedFilters, pagination.page, pagination.limit]);

  // Lida com a mudança nos inputs de filtro (não executa busca)
  const handleFilterInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFilterInputs((prevInputs) => ({
        ...prevInputs,
        [name]: value,
      }));
    },
    []
  );

  // Aplica os filtros (executa a busca)
  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filterInputs }); // Copia os valores dos inputs para os filtros aplicados
    setPagination((prev) => ({ ...prev, page: 1 })); // Reinicia para a primeira página
  }, [filterInputs]);

  // Lida com a limpeza dos filtros
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      invoiceId: "",
      number: "",
    };
    setFilterInputs(emptyFilters); // Limpa os inputs
    setAppliedFilters(emptyFilters); // Limpa os filtros aplicados
    setPagination((prev) => ({ ...prev, page: 1 })); // Reinicia a página
  }, []);

  // Permite aplicar filtros ao pressionar Enter em qualquer campo
  const handleFilterKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleApplyFilters();
      }
    },
    [handleApplyFilters]
  );

  // Lida com a mudança de página
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPagination((prev) => ({ ...prev, page: newPage }));
      }
    },
    [totalPages]
  );

  // Lida com a mudança do limite de itens por página
  const handleLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPagination({
        limit: Number(e.target.value),
        page: 1, // Volta para a primeira página ao mudar o limite
      });
    },
    []
  );

  // Lida com a exclusão de número da sorte
  const handleDelete = async () => {
    if (deletingDrawNumberId) {
      const success = await deleteDrawNumber(deletingDrawNumberId);
      if (success) {
        // Após a exclusão, tenta buscar os números novamente.
        // Se a página atual ficar vazia e não for a primeira, volta para a anterior.
        if (drawNumbers.length === 1 && currentPage > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Rebusca na página atual, considerando os filtros aplicados
          fetchDrawNumbers({
            ...appliedFilters,
            page: currentPage,
            limit: pagination.limit,
          });
        }
      }
      setDeletingDrawNumberId(null); // Fecha modal
    }
  };

  // Lida com a exportação
  const handleExport = useCallback(
    async (exportParams: any) => {
      const combinedParams = {
        ...exportParams.filters, // Filtros da listagem
        startDate: exportParams.startDate,
        endDate: exportParams.endDate,
        format: exportParams.format,
      };
      return await exportDrawNumbers(combinedParams);
    },
    [exportDrawNumbers, appliedFilters]
  );

  // Verifica se há filtros aplicados para mostrar indicador visual
  const hasAppliedFilters = useMemo(() => {
    return Object.values(appliedFilters).some((value) => value.trim() !== "");
  }, [appliedFilters]);

  // Verifica se há diferenças entre os inputs e os filtros aplicados
  const hasUnappliedChanges = useMemo(() => {
    return JSON.stringify(filterInputs) !== JSON.stringify(appliedFilters);
  }, [filterInputs, appliedFilters]);

  // Renderiza linhas de esqueleto quando isLoading é true
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
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      </tr>
    ));
  }, [isLoading, pagination.limit]);

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="page-title mb-4 sm:mb-0">Números da Sorte</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Botão Exportar */}
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

      {/* Exibição de Erros */}
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
            <h2 className="card-title">Filtrar Números da Sorte</h2>
            {hasAppliedFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtros ativos
              </span>
            )}
          </div>
          {hasUnappliedChanges && (
            <span className="text-xs text-amber-600 font-medium">
              Alterações não aplicadas
            </span>
          )}
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            className="form-input"
            placeholder="Filtrar por ID da Fatura"
            name="invoiceId"
            value={filterInputs.invoiceId}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Filtrar por Número da Sorte"
            name="number"
            value={filterInputs.number}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
        </div>
        <div className="card-footer flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Informações sobre filtros aplicados */}
          <div className="text-sm text-gray-600">
            {hasAppliedFilters ? (
              <span>
                Filtros aplicados:{" "}
                {Object.entries(appliedFilters)
                  .filter(([_, value]) => value.trim() !== "")
                  .map(([key, value]) => `${key}: "${value}"`)
                  .join(", ")}
              </span>
            ) : (
              <span>Nenhum filtro aplicado</span>
            )}
          </div>

          {/* Botões de ação */}
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

      {/* Tabela de Números da Sorte */}
      <div className="card table-container">
        <div className="card-body p-0">
          <table className="table data-table">
            <thead>
              <tr>
                <th className="w-10">ID</th>
                <th>Número da Sorte</th>
                <th>Ativo</th>
                <th>Ganhador Em</th>
                <th>ID Fatura</th>
                <th>Cód. Fiscal Fatura</th>
                <th>Nome Cliente</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && renderSkeletonRows}
              {!isLoading && drawNumbers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    {hasAppliedFilters
                      ? "Nenhum número da sorte encontrado com os filtros aplicados."
                      : "Nenhum número da sorte cadastrado."}
                  </td>
                </tr>
              )}
              {!isLoading &&
                drawNumbers.map((drawNumber) => (
                  <tr key={drawNumber.id} className="table-row">
                    <td>{drawNumber.id}</td>
                    <td>{drawNumber.number}</td>
                    <td>{drawNumber.active ? "Sim" : "Não"}</td>
                    <td>
                      {drawNumber.winnerAt
                        ? new Date(drawNumber.winnerAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td>{drawNumber.invoiceId}</td>
                    <td>{drawNumber.fiscalCode || "N/A"}</td>
                    <td>{drawNumber.clientName || "N/A"}</td>
                    <td className="flex items-center justify-center space-x-2">
                      {/* Botões de Ação */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(`/draw-numbers/${drawNumber.id}`)
                        }
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/** 
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          navigate(`/draw-numbers/${drawNumber.id}/edit`)
                        }
                        title="Atualizar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeletingDrawNumberId(drawNumber.id)}
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
            {totalEntities} números da sorte
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
      {deletingDrawNumberId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o número da sorte de ID{" "}
                <strong>{deletingDrawNumberId}</strong>? Essa ação não pode ser
                desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingDrawNumberId(null)}
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
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isLoading}
        title="Exportar Números da Sorte"
        currentFilters={appliedFilters} // Passa os filtros atuais
        entityName="números da sorte"
      />
    </div>
  );
}
