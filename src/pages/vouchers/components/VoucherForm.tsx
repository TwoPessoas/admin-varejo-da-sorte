// src/components/VoucherForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react"; // XCircle para feedback de erro

// Esquema de validação Zod para os dados do voucher no formulário
const voucherFormSchema = z.object({
  coupom: z.string().nonempty("O cupom é obrigatório."),
  gameOpportunityId: z
    .number()
    .int()
    .positive("ID da Oportunidade de Jogo deve ser um número inteiro positivo.")
    .nullable(),
  drawDate: z.string().optional(), // `type="date"` input retorna string no formato "YYYY-MM-DD"
  voucherValue: z.string().nullable(),
});

// Tipo inferido do schema Zod para os valores do formulário
type VoucherFormValues = z.infer<typeof voucherFormSchema>;

// Interface para as props do componente VoucherForm
interface VoucherFormProps {
  initialValues?: Partial<VoucherFormValues>; // Valores iniciais para preencher o formulário (ex: para edição)
  onSubmit: (data: VoucherFormValues) => Promise<void>; // Função a ser chamada no submit
  isLoading?: boolean; // Estado de carregamento, para desabilitar o botão de submit
}

/**
 * Componente de formulário para criar ou editar um Voucher.
 * Utiliza React Hook Form para gerenciamento de formulário e Zod para validação.
 */
export default function VoucherForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
}: VoucherFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      ...initialValues,
      // Garante que valores numéricos que podem ser null (vindos da API) sejam tratados como string vazia para inputs de texto
      gameOpportunityId: initialValues.gameOpportunityId ?? null,
      voucherValue: initialValues.voucherValue ?? null, // Converte para string e substitui ponto por vírgula para exibir
    },
  });

  // Opcional: Se initialValues puderem mudar dinamicamente após a montagem, use useEffect para resetar o form
  // useEffect(() => {
  //   reset({
  //     ...initialValues,
  //     gameOpportunityId: initialValues.gameOpportunityId === null ? "" : initialValues.gameOpportunityId?.toString(),
  //     voucherValue: initialValues.voucherValue === null ? "" : initialValues.voucherValue?.toString().replace('.', ','),
  //   });
  // }, [initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card" // Classe 'card' para consistência visual
    >
      <div className="card-header">
        <h2 className="card-title">Dados do Voucher</h2>
        <p className="card-subtitle">
          Preencha as informações para cadastrar ou editar um voucher.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações do Voucher */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Informações Principais
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cupom */}
            <div className="form-group">
              <label htmlFor="coupom" className="form-label">
                Cupom <span className="text-red-500">*</span>
              </label>
              <input
                {...register("coupom")}
                type="text"
                id="coupom"
                className={`form-input ${
                  errors.coupom ? "border-red-300" : ""
                }`}
                placeholder="Ex: CUPOM123ABC"
              />
              {errors.coupom && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.coupom.message}
                </p>
              )}
            </div>

            {/* ID da Oportunidade do Jogo */}
            <div className="form-group">
              <label htmlFor="gameOpportunityId" className="form-label">
                ID da Oportunidade do Jogo
              </label>
              <input
                {...register("gameOpportunityId")}
                type="text" // Usar "text" para lidar com string vazia e depois converter
                id="gameOpportunityId"
                className={`form-input ${
                  errors.gameOpportunityId ? "border-red-300" : ""
                }`}
                placeholder="Ex: 123 (opcional)"
              />
              {errors.gameOpportunityId && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.gameOpportunityId.message}
                </p>
              )}
            </div>

            {/* Data do Sorteio */}
            <div className="form-group">
              <label htmlFor="drawDate" className="form-label">
                Data do Sorteio
              </label>
              <input
                {...register("drawDate")}
                type="date"
                id="drawDate"
                className={`form-input ${
                  errors.drawDate ? "border-red-300" : ""
                }`}
              />
              {errors.drawDate && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.drawDate.message}
                </p>
              )}
            </div>

            {/* Valor do Voucher */}
            <div className="form-group">
              <label htmlFor="voucherValue" className="form-label">
                Valor do Voucher
              </label>
              <input
                {...register("voucherValue")}
                type="text" // Usar "text" para permitir vírgula e depois converter
                id="voucherValue"
                className={`form-input ${
                  errors.voucherValue ? "border-red-300" : ""
                }`}
                placeholder="Ex: 100,50 (opcional)"
              />
              {errors.voucherValue && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.voucherValue.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      </div>

      {/* Botão de Enviar */}
      <div className="card-footer">
        <button
          type="submit"
          className={`btn btn-primary w-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Salvar Voucher
        </button>
      </div>
    </form>
  );
}
