// src/pages/VoucherCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast"; // Importa a função toast para notificações
import useVoucher from "../../hooks/useVoucher";
import VoucherForm from "./components/VoucherForm";

// Definindo o tipo para os valores do formulário, que são os mesmos esperados pelo schema Zod do VoucherForm
// É importante que este tipo seja compatível com o 'VoucherFormValues' definido em VoucherForm.tsx
interface VoucherFormValues {
  coupom: string;
  gameOpportunityId: number | null;
  drawDate?: string;
  voucherValue: string | null;
}

export default function VoucherCreatePage() {
  const { createVoucher, isLoading } = useVoucher(); // Obtém a função de criação e o estado de loading do hook
  const navigate = useNavigate(); // Hook para navegação programática

  // Lidar com o envio do formulário de criação de voucher
  const handleCreate = async (data: VoucherFormValues) => {
    try {
      // Chama a função createVoucher do hook, passando os dados do formulário.
      // O useVoucher já gerencia a exibição de toasts de sucesso ou erro interno.
      const newVoucher = await createVoucher(data);

      if (newVoucher) {
        // Se a criação for bem-sucedida (retorna um voucher), redireciona para a listagem
        navigate("/vouchers");
      } else {
        // Se newVoucher for null, significa que houve um erro tratado no useVoucher
        // e o toast de erro já foi exibido lá. Podemos, opcionalmente, adicionar
        // uma mensagem mais genérica aqui se for necessário um fallback adicional.
        toast.error(
          "Erro ao criar voucher. Por favor, verifique os dados e tente novamente."
        );
      }
    } catch (err: any) {
      // Este catch é para erros inesperados que não foram tratados dentro do useVoucher
      console.error("Erro inesperado ao criar voucher:", err);
      toast.error(
        "Erro inesperado ao criar voucher. Tente novamente mais tarde."
      );
    }
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/vouchers")} // Botão para voltar à lista de vouchers
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Novo Voucher</h1>
      </div>

      {/* Formulário Reutilizável de Voucher */}
      <VoucherForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
