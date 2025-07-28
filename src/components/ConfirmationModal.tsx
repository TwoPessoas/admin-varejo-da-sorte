// src/components/ConfirmationModal.tsx
import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

/**
 * Interface para as propriedades do ConfirmationModal.
 * Define todas as opções de customização disponíveis para o modal.
 */
interface ConfirmationModalProps {
  /** Controla se o modal está visível ou não */
  isOpen: boolean;
  /** Função chamada quando o modal deve ser fechado */
  onClose: () => void;
  /** Função chamada quando o usuário confirma a ação */
  onConfirm: () => void;
  /** Título exibido no cabeçalho do modal */
  title: string;
  /** Mensagem principal do modal */
  message: string;
  /** Texto do botão de confirmação (padrão: "Confirmar") */
  confirmText?: string;
  /** Texto do botão de cancelamento (padrão: "Cancelar") */
  cancelText?: string;
  /** Classe CSS adicional para o botão de confirmação (ex: "btn-danger") */
  confirmButtonClass?: string;
  /** Classe CSS adicional para o botão de cancelamento */
  cancelButtonClass?: string;
  /** Indica se uma operação está sendo processada (mostra loading) */
  isProcessing?: boolean;
  /** Tipo do modal que define o ícone e cores (padrão: "warning") */
  type?: "warning" | "danger" | "info" | "success";
  /** Permite fechar o modal clicando fora dele (padrão: true) */
  closeOnBackdropClick?: boolean;
  /** Permite fechar o modal pressionando Escape (padrão: true) */
  closeOnEscape?: boolean;
  /** Conteúdo adicional opcional para ser exibido abaixo da mensagem */
  children?: React.ReactNode;
}

/**
 * Componente ConfirmationModal - Modal reutilizável para confirmação de ações.
 *
 * Características:
 * - Suporte a diferentes tipos visuais (warning, danger, info, success)
 * - Botões customizáveis com classes CSS
 * - Estado de carregamento integrado
 * - Fechamento por backdrop ou tecla Escape
 * - Acessibilidade com foco automático e navegação por teclado
 * - Animações suaves de entrada e saída
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonClass = "btn-primary",
  cancelButtonClass = "btn-secondary",
  isProcessing = false,
  type = "warning",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  children,
}: ConfirmationModalProps) {
  // Efeito para lidar com a tecla Escape
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isProcessing) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, isProcessing, onClose]);

  // Efeito para gerenciar o foco e scroll do body
  React.useEffect(() => {
    if (isOpen) {
      // Previne scroll do body quando o modal está aberto
      document.body.style.overflow = "hidden";

      // Foca no modal para acessibilidade
      const modalElement = document.getElementById("confirmation-modal");
      if (modalElement) {
        modalElement.focus();
      }
    } else {
      // Restaura o scroll do body quando o modal é fechado
      document.body.style.overflow = "unset";
    }

    // Cleanup: sempre restaura o overflow quando o componente é desmontado
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Lida com o clique no backdrop (fundo do modal)
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Verifica se o clique foi diretamente no backdrop e não em um elemento filho
    if (
      event.target === event.currentTarget &&
      closeOnBackdropClick &&
      !isProcessing
    ) {
      onClose();
    }
  };

  // Lida com a confirmação da ação
  const handleConfirm = () => {
    if (!isProcessing) {
      onConfirm();
    }
  };

  // Lida com o cancelamento/fechamento
  const handleCancel = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  // Função para obter o ícone baseado no tipo do modal
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "info":
        return <AlertTriangle className="w-6 h-6 text-blue-600" />;
      case "success":
        return <AlertTriangle className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  // Função para obter as classes CSS do cabeçalho baseado no tipo
  const getHeaderClasses = () => {
    switch (type) {
      case "danger":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-yellow-200 bg-yellow-50";
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Overlay de fundo com animação */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out"
          aria-hidden="true"
        ></div>

        {/* Elemento invisível para centralização em telas maiores */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Container do Modal */}
        <div
          id="confirmation-modal"
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          tabIndex={-1}
          style={{
            animation: isOpen ? "modalSlideIn 0.3s ease-out" : undefined,
          }}
        >
          {/* Cabeçalho do Modal */}
          <div className={`px-4 py-3 border-b ${getHeaderClasses()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getIcon()}
                <h3
                  className="text-lg font-medium text-gray-900"
                  id="modal-title"
                >
                  {title}
                </h3>
              </div>
              {/* Botão de fechar (X) */}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1 transition-colors duration-200"
                onClick={handleCancel}
                disabled={isProcessing}
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Corpo do Modal */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <div className="mt-2">
                <p className="text-sm text-gray-500 leading-relaxed">
                  {message}
                </p>
                {/* Conteúdo adicional opcional */}
                {children && <div className="mt-4">{children}</div>}
              </div>
            </div>
          </div>

          {/* Rodapé com Botões */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {/* Botão de Confirmação */}
            <button
              type="button"
              className={`w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ${confirmButtonClass} ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {confirmText}
            </button>

            {/* Botão de Cancelamento */}
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200 ${cancelButtonClass} ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
