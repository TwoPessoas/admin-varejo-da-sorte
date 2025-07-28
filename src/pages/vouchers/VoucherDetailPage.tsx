// src/pages/VoucherDetailPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, ArrowLeft, Edit, Trash2, XCircle } from "lucide-react";
import useVoucher from "../../hooks/useVoucher";
import DateUtils from "../../utils/DateUtils";

// Definindo a interface Voucher, se não estiver disponível globalmente
// (Já está definida em useVoucher.ts, mas é bom ter uma referência local se precisar)
interface Voucher {
  id: number;
  coupom: string;
  gameOpportunityId: number | null;
  drawDate: string | null;
  voucherValue: string | null;
  emailSendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function VoucherDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID do voucher da URL
  const { getVoucher, deleteVoucher, isLoading } = useVoucher(); // Usa o hook useVoucher

  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [isFetchingVoucher, setIsFetchingVoucher] = useState(true); // Para o carregamento inicial
  const [fetchVoucherError, setFetchVoucherError] = useState<string | null>(
    null
  ); // Para erros no carregamento inicial
  const [deletingVoucher, setDeletingVoucher] = useState<number | null>(null); // Para o modal de exclusão
  const navigate = useNavigate();

  // Efeito para buscar os dados do voucher
  useEffect(() => {
    const fetchCurrentVoucher = async () => {
      if (!id) {
        setFetchVoucherError("ID do voucher não fornecido na URL.");
        setIsFetchingVoucher(false);
        return;
      }

      setIsFetchingVoucher(true);
      setFetchVoucherError(null);
      setVoucher(null); // Limpa dados anteriores

      try {
        const data = await getVoucher(Number(id));
        if (data) {
          setVoucher(data);
        } else {
          setFetchVoucherError(
            "Voucher não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch voucher:", err);
        setFetchVoucherError(
          "Falha ao carregar os detalhes do voucher. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingVoucher(false);
      }
    };

    fetchCurrentVoucher();
  }, [id]); // Adiciona getVoucher nas dependências para ESLint

  // Lida com a exclusão do voucher
  const handleDelete = useCallback(async () => {
    if (voucher && voucher.id) {
      const success = await deleteVoucher(voucher.id); // O useVoucher já dispara toast de sucesso/erro
      if (success) {
        navigate("/vouchers"); // Redireciona para a lista após a exclusão
      }
      setDeletingVoucher(null); // Fecha o modal
    }
  }, [voucher, deleteVoucher, navigate]);

  // Handle loading state for initial fetch
  if (isFetchingVoucher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Loader className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-lg text-gray-700">
          Carregando detalhes do voucher...
        </p>
      </div>
    );
  }

  // Handle error state for initial fetch
  if (fetchVoucherError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar voucher
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchVoucherError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/vouchers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de vouchers
        </button>
      </div>
    );
  }

  // Handle no data state (voucher not found after successful fetch, or ID was missing)
  if (!voucher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Voucher não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum voucher.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/vouchers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de vouchers
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
          onClick={() => navigate("/vouchers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Voucher</h1>
        {/* Ações: Editar e Excluir */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            className="btn btn-success w-full sm:w-auto"
            onClick={() => navigate(`/vouchers/${voucher.id}/edit`)}
          >
            <Edit className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            className="btn btn-danger w-full sm:w-auto"
            onClick={() => setDeletingVoucher(voucher.id)}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Informações do Voucher */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Voucher: {voucher.coupom || "Sem Cupom"}
          </h3>
          <p className="card-subtitle text-sm text-gray-600">
            ID: {voucher.id}
          </p>
        </div>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Dados Principais */}
          <div className="md:col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Detalhes do Voucher
            </h4>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Cupom</h4>
            <p className="text-gray-800">{voucher.coupom || "Não informado"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              ID da Oportunidade do Jogo
            </h4>
            <p className="text-gray-800">
              {voucher.gameOpportunityId || "Não associado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Data do Sorteio
            </h4>
            <p className="text-gray-800">
              {voucher.drawDate
                ? DateUtils.toDateTimePtBr(voucher.drawDate) // Usando DateUtils para formatar apenas a data
                : "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Valor do Voucher
            </h4>
            <p className="text-gray-800">
              {voucher.voucherValue !== null
                ? `R\$ ${voucher.voucherValue}` // Formata para moeda PT-BR
                : "Não informado"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              E-mail Enviado em
            </h4>
            <p className="text-gray-800">
              {voucher.emailSendedAt
                ? DateUtils.toDateTimePtBr(voucher.emailSendedAt) // Formata data e hora
                : "Não enviado"}
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
              {DateUtils.toDateTimePtBr(voucher.createdAt)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              Última Atualização
            </h4>
            <p className="text-gray-800">
              {DateUtils.toDateTimePtBr(voucher.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Confirmar Exclusão (Reutilizado da ClientListPage) */}
      {deletingVoucher && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o voucher{" "}
                <strong>
                  {voucher.coupom || "Sem Cupom"} (ID: {deletingVoucher})
                </strong>
                ? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingVoucher(null)}
                disabled={isLoading} // isLoading do useVoucher para a operação de delete
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
