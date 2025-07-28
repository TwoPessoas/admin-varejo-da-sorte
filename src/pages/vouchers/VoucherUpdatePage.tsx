// src/pages/VoucherUpdatePage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react"; // Adicionado Loader para carregamento
import useVoucher from "../../hooks/useVoucher"; // Certifique-se que o caminho está correto
import toast from "react-hot-toast"; // Importa toast para notificações de erro (se necessário)
import VoucherForm from "./components/VoucherForm";

// Definindo o tipo para os valores do formulário, que são os mesmos esperados pelo schema Zod do VoucherForm.
// Isso garante que o tipo dos dados passados para o formulário e recebidos dele seja consistente.
interface VoucherFormValues {
  coupom: string;
  gameOpportunityId: number | null;
  drawDate?: string;
  voucherValue: string | null;
}

export default function VoucherUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do useVoucher
  // isLoading aqui é para o 'updateVoucher', não para o 'getVoucher' inicial.
  const { getVoucher, updateVoucher, isLoading: isUpdatingVoucher } = useVoucher();

  // Estados locais para gerenciar o carregamento e os dados do voucher para o formulário
  const [initialVoucherData, setInitialVoucherData] =
    useState<Partial<VoucherFormValues> | null>(null);
  const [isFetchingVoucher, setIsFetchingVoucher] = useState(true); // Estado de carregamento para a busca inicial
  const [fetchVoucherError, setFetchVoucherError] = useState<string | null>(null); // Estado de erro para a busca inicial

  // Efeito para buscar os dados do voucher ao carregar a página ou mudar o ID
  useEffect(() => {
    const fetchCurrentVoucher = async () => {
      if (!id) {
        setFetchVoucherError("ID do voucher não fornecido na URL.");
        setIsFetchingVoucher(false);
        return;
      }

      setIsFetchingVoucher(true);
      setFetchVoucherError(null); // Limpa erros anteriores de busca
      setInitialVoucherData(null); // Limpa dados anteriores

      try {
        const voucher = await getVoucher(Number(id)); // Chama o getVoucher do hook
        if (voucher) {
          // Formata a data de sorteio se existir (removendo a parte da hora para input type="date")
          setInitialVoucherData({
            coupom: voucher.coupom,
            gameOpportunityId: voucher.gameOpportunityId,
            drawDate: voucher.drawDate ? voucher.drawDate.split("T")[0] : "", // Importante para input type="date"
            voucherValue: voucher.voucherValue,
          });
        } else {
          setFetchVoucherError(
            "Voucher não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar voucher:", err);
        setFetchVoucherError(
          "Falha ao carregar os dados do voucher. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingVoucher(false);
      }
    };

    fetchCurrentVoucher();
  }, [id]); // Adiciona getVoucher nas dependências para ESLint

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: VoucherFormValues) => {
      if (!id) {
        toast.error(
          "Não foi possível atualizar: ID do voucher não encontrado."
        );
        return;
      }
      // O useVoucher já dispara toasts de sucesso/erro para o updateVoucher
      const updatedVoucher = await updateVoucher(Number(id), data);
      if (updatedVoucher) {
        // Navega após o toast de sucesso ser disparado pelo hook
        navigate("/vouchers");
      }
      // Se updatedVoucher for null, o toast.error já foi disparado pelo useVoucher
    },
    [id, updateVoucher, navigate]
  );

  // Exibição de estado de carregamento inicial
  if (isFetchingVoucher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-3 text-lg text-gray-700">
          Carregando dados do voucher...
        </p>
      </div>
    );
  }

  // Exibição de erro na busca inicial do voucher
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

  // Se initialVoucherData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialVoucherData) {
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

  // Renderiza o formulário quando os dados estão prontos
  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/vouchers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Atualizar Voucher</h1>
      </div>

      {/* Formulário de Atualização */}
      <VoucherForm
        initialValues={initialVoucherData} // Passa os dados do voucher carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingVoucher} // Passa o estado de carregamento do updateVoucher
      />
    </div>
  );
}