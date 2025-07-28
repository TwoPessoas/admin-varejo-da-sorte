// src/pages/InvoiceListPage.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Importa useLocation para ler query params
import useInvoice from "../../hooks/useInvoice";
import {
  Eye,
  Trash2,
  Plus,
  Download,
  XCircle,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  X,
  User,
} from "lucide-react";
import ExportModal from "../../components/ExportModal";
import ConfirmationModal from "../../components/ConfirmationModal";

export default function InvoiceListPage() {
  const {
    invoices,
    fetchInvoices,
    deleteInvoice,
    exportInvoices,
    isLoading,
    error,
    totalEntities,
    currentPage,
    totalPages,
  } = useInvoice();

  const navigate = useNavigate();
  const location = useLocation(); // Para ler query parameters da URL

  // Estados para filtros (valores dos inputs)
  // Adiciona campos de filtro específicos para faturas
  const [filterInputs, setFilterInputs] = useState({
    fiscalCode: "",
    cnpj: "",
    store: "",
    pdv: "",
    clientId: "", // Para filtrar faturas por um cliente específico
  });

  // Estados para filtros aplicados (valores que serão enviados para a API)
  const [appliedFilters, setAppliedFilters] = useState({
    fiscalCode: "",
    cnpj: "",
    store: "",
    pdv: "",
    clientId: "",
  });

  // Estados para paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Estado para controle do modal de exclusão
  const [deletingInvoice, setDeletingInvoice] = useState<number | null>(null);
  // Estado para controle da exportação
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Efeito para buscar faturas quando os filtros aplicados ou a paginação mudam
  useEffect(() => {
    fetchInvoices({
      ...appliedFilters, // Usa os filtros aplicados
      page: pagination.page,
      limit: pagination.limit,
    });
    // Adiciona `fetchInvoices` às dependências para garantir que o efeito seja reexecutado
    // se a função `fetchInvoices` for recriada (embora em hooks geralmente não aconteça)
  }, [appliedFilters, pagination.page, pagination.limit]);

  // Carrega os dados iniciais na primeira renderização e verifica query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const clientIdFromUrl = queryParams.get("clientId");

    // Se clientId estiver na URL, aplica como filtro inicial
    if (clientIdFromUrl) {
      setFilterInputs((prev) => ({ ...prev, clientId: clientIdFromUrl }));
      setAppliedFilters((prev) => ({ ...prev, clientId: clientIdFromUrl }));
      // Isso fará com que o useEffect principal chame fetchInvoices com o filtro aplicado
    } else {
      // Se não houver clientId na URL, faz a primeira busca sem ele
      fetchInvoices({
        page: 1,
        limit: 10,
      });
    }
  }, [location.search]); // Depende da mudança na URL

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
      fiscalCode: "",
      cnpj: "",
      store: "",
      numCoupon: "",
      pdv: "",
      clientId: "",
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

  // Lida com a exclusão de fatura
  const handleDelete = async () => {
    if (deletingInvoice) {
      const success = await deleteInvoice(deletingInvoice);
      if (success) {
        // Após a exclusão, tenta buscar as faturas novamente.
        // Se a página atual ficar vazia e não for a primeira, volta para a anterior.
        if (invoices.length === 1 && currentPage > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          // Rebusca na página atual, considerando os filtros aplicados
          fetchInvoices({
            ...appliedFilters,
            page: currentPage,
            limit: pagination.limit,
          });
        }
      }
      setDeletingInvoice(null); // Fecha modal
    }
  };

  // Lida com a exportação
  const handleExport = useCallback(
    async (exportParams: any) => {
      // Combina os filtros aplicados com os parâmetros de exportação
      const combinedParams = {
        ...exportParams.filters, // Filtros da listagem
        startDate: exportParams.startDate,
        endDate: exportParams.endDate,
        format: exportParams.format,
      };

      return await exportInvoices(combinedParams);
    },
    [exportInvoices] // 'appliedFilters' não precisa aqui, pois 'exportParams.filters' já traz o que foi aplicado
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
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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

  // Formata o valor da fatura
  const formatInvoiceValue = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="page-title mb-4 sm:mb-0">Lista de Faturas</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Botão Nova Fatura */}
          <button
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => navigate("/invoices/new")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Fatura
          </button>

          {/* Botão Exportar */}
          <button
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => setIsExportModalOpen(true)} // Abre o modal em vez de exportar diretamente
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
            <h2 className="card-title">Filtrar Faturas</h2>
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
        <div className="card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            className="form-input"
            placeholder="Código Fiscal"
            name="fiscalCode"
            value={filterInputs.fiscalCode}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="CNPJ"
            name="cnpj"
            value={filterInputs.cnpj}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Loja"
            name="store"
            value={filterInputs.store}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="PDV"
            name="pdv"
            value={filterInputs.pdv}
            onChange={handleFilterInputChange}
            onKeyPress={handleFilterKeyPress}
          />
          <input
            type="text"
            className="form-input"
            placeholder="ID do Cliente"
            name="clientId"
            value={filterInputs.clientId}
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

      {/* Tabela de Faturas */}
      <div className="card table-container">
        <div className="card-body p-0">
          <table className="table data-table">
            <thead>
              <tr>
                <th className="w-10">ID</th>
                <th>Código Fiscal</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>PDV</th>
                <th>Loja</th>
                <th>Cupom</th>
                <th>CNPJ</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && renderSkeletonRows}
              {!isLoading && invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 py-8">
                    {hasAppliedFilters
                      ? "Nenhuma fatura encontrada com os filtros aplicados."
                      : "Nenhuma fatura cadastrada."}
                  </td>
                </tr>
              )}
              {!isLoading &&
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td>{invoice.id}</td>
                    <td>{invoice.fiscalCode}</td>
                    <td>
                      {invoice.clientName || "N/A"}
                      {invoice.clientCpf && ` (${invoice.clientCpf})`}
                    </td>
                    <td>{formatInvoiceValue(invoice.invoceValue)}</td>
                    <td>{invoice.pdv || "N/A"}</td>
                    <td>{invoice.store || "N/A"}</td>
                    <td>{invoice.numCoupon || "N/A"}</td>
                    <td>{invoice.cnpj || "N/A"}</td>
                    <td className="flex items-center justify-center space-x-2">
                      {/* Botão Ver Cliente */}
                      {invoice.clientId && (
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() =>
                            navigate(`/clients/${invoice.clientId}`)
                          }
                          title="Ver Cliente"
                        >
                          <User className="w-4 h-4" />
                        </button>
                      )}
                      {/* Botão Ver Detalhes da Fatura */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Botão Atualizar (se a rota PUT for habilitada) */}
                      {/* A rota PUT está comentada no backend, então este botão está aqui como placeholder */}
                      {/* <button
                        className="btn btn-success btn-sm"
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                        title="Atualizar"
                      >
                        <Edit className="w-4 h-4" />
                      </button> */}
                      {/* Botão Deletar */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeletingInvoice(invoice.id)}
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
            {totalEntities} faturas
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
      <ConfirmationModal
        isOpen={deletingInvoice !== null}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a fatura de ID ${deletingInvoice}? Essa ação não pode ser desfeita!`}
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmButtonClass="btn-danger"
        isProcessing={isLoading}
      />

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isLoading}
        title="Exportar Faturas"
        currentFilters={appliedFilters} // Passa os filtros atuais para o modal
        entityName="faturas"
      />
    </div>
  );
}
