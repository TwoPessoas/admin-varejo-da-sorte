// src/components/ExportModal.tsx
import React, { useState, useCallback } from "react";
import { Download, X, Calendar, Filter, Loader } from "lucide-react";
import toast from "react-hot-toast";

// Interface para os filtros que podem ser passados para exportação
interface ExportFilters {
  [key: string]: string | undefined;
}

// Props do componente
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (params: ExportParams) => Promise<boolean>;
  isLoading?: boolean;
  title?: string;
  currentFilters?: ExportFilters; // Filtros atuais da listagem
  entityName?: string; // Nome da entidade (ex: "clientes", "produtos")
}

// Parâmetros de exportação que serão enviados
interface ExportParams {
  startDate?: string;
  endDate?: string;
  format?: "csv" | "xlsx" | "pdf";
  filters?: ExportFilters;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  isLoading = false,
  title = "Exportar Dados",
  currentFilters = {},
  entityName = "registros",
}: ExportModalProps) {
  // Estados do formulário
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [includeFilters, setIncludeFilters] = useState(true);

  // Reseta o formulário quando o modal é fechado
  const handleClose = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setFormat("csv");
    setIncludeFilters(true);
    onClose();
  }, [onClose]);

  // Lida com a submissão do formulário
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validação básica de datas
      if (startDate && endDate && startDate > endDate) {
        toast.error("A data de início deve ser anterior à data de fim.");
        return;
      }

      // Prepara os parâmetros para exportação
      const exportParams: ExportParams = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format,
        filters: includeFilters ? currentFilters : {},
      };

      // Chama a função de exportação
      const success = await onExport(exportParams);

      // Fecha o modal se a exportação foi bem-sucedida
      if (success) {
        handleClose();
      }
    },
    [
      startDate,
      endDate,
      format,
      includeFilters,
      currentFilters,
      onExport,
      handleClose,
    ]
  );

  // Conta quantos filtros estão ativos
  const activeFiltersCount = Object.values(currentFilters).filter(
    (value) => value && value.trim() !== ""
  ).length;

  // Não renderiza nada se o modal não estiver aberto
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <form onSubmit={handleSubmit}>
          {/* Header do Modal */}
          <div className="modal-header flex justify-between">
            <h3 className="text-lg font-bold flex items-center">
              <Download className="w-5 h-5 mr-2" />
              {title}
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body do Modal */}
          <div className="modal-body space-y-4">
            {/* Informação sobre filtros ativos */}
            {activeFiltersCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      {activeFiltersCount} filtro(s) ativo(s)
                    </span>
                  </div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={includeFilters}
                      onChange={(e) => setIncludeFilters(e.target.checked)}
                      className="form-checkbox text-blue-600"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-blue-700">
                      Incluir na exportação
                    </span>
                  </label>
                </div>

                {includeFilters && (
                  <div className="mt-2 text-xs text-blue-600">
                    Filtros:{" "}
                    {Object.entries(currentFilters)
                      .filter(([_, value]) => value && value.trim() !== "")
                      .map(([key, value]) => `${key}: "${value}"`)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Seleção de Período */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-medium text-gray-700 px-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período de Criação (Opcional)
              </legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label text-sm">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label text-sm">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Deixe em branco para exportar todos os {entityName} independente
                da data de criação.
              </p>
            </fieldset>

            {/* Formato de Exportação */}
            <div className="form-group">
              <label htmlFor="format" className="form-label">
                Formato do Arquivo
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) =>
                  setFormat(e.target.value as "csv" | "xlsx" | "pdf")
                }
                className="form-input"
                disabled={isLoading}
              >
                <option value="csv">CSV (Comma Separated Values)</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            {/* Resumo da Exportação */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <strong>Resumo:</strong> Exportar {entityName}
              {startDate &&
                endDate &&
                ` criados entre ${new Date(startDate).toLocaleDateString(
                  "pt-BR"
                )} e ${new Date(endDate).toLocaleDateString("pt-BR")}`}
              {startDate &&
                !endDate &&
                ` criados a partir de ${new Date(startDate).toLocaleDateString(
                  "pt-BR"
                )}`}
              {!startDate &&
                endDate &&
                ` criados até ${new Date(endDate).toLocaleDateString("pt-BR")}`}
              {!startDate && !endDate && " (todos os períodos)"}
              {includeFilters &&
                activeFiltersCount > 0 &&
                ` com ${activeFiltersCount} filtro(s) aplicado(s)`}
              {` no formato ${format.toUpperCase()}.`}
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
