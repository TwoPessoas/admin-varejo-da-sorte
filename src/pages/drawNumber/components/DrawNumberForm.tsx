// src/components/DrawNumberForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react";
import DateTimeConverter from "../../../utils/DateTimeConverter";

// Esquema de validação Zod para os dados do Número da Sorte
const drawNumberSchema = z.object({
  // 'number' é obrigatório e deve ser um número inteiro positivo
  number: z
    .number({ error: "O número deve ser um valor numérico." })
    .int("O número deve ser um valor inteiro.")
    .positive("O número deve ser um valor positivo."),

  // 'invoiceId' é obrigatório e deve ser um número inteiro positivo
  invoiceId: z
    .number({ error: "O ID da fatura deve ser um valor numérico." })
    .int("O ID da fatura deve ser um valor inteiro.")
    .positive("O ID da fatura deve ser um valor positivo."),

  // 'active' é opcional e booleano
  active: z.boolean().optional(),

  // 'winnerAt' e 'emailSendedAt' são opcionais e podem ser nulos/vazios
  // Serão tratados como strings no formulário e convertidos para/de ISO na submissão
  winnerAt: z.string().optional().nullable(),
  emailSendedAt: z.string().optional().nullable(),
});

// Tipo derivado do esquema Zod para os valores do formulário
type DrawNumberFormValues = z.infer<typeof drawNumberSchema>;

// Interface para as propriedades do componente DrawNumberForm
interface DrawNumberFormProps {
  initialValues?: Partial<DrawNumberFormValues>; // Valores iniciais para edição
  onSubmit: (data: DrawNumberFormValues) => Promise<void>; // Função chamada no submit
  isLoading?: boolean; // Estado de carregamento para o botão de submit
}

export default function DrawNumberForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
}: DrawNumberFormProps) {
  // Converte as datas ISO dos initialValues para o formato do input datetime-local
  const processedInitialValues = {
    ...initialValues,
    winnerAt: DateTimeConverter.toInputDateTime(initialValues.winnerAt),
    emailSendedAt: DateTimeConverter.toInputDateTime(
      initialValues.emailSendedAt
    ),
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DrawNumberFormValues>({
    resolver: zodResolver(drawNumberSchema),
    defaultValues: processedInitialValues,
  });

  // Função customizada de submissão para converter as datas de volta para ISO
  const handleFormSubmit = async (data: DrawNumberFormValues) => {
    const dataToSend = {
      ...data,
      winnerAt: DateTimeConverter.toISOString(data.winnerAt),
      emailSendedAt: DateTimeConverter.toISOString(data.emailSendedAt),
    };
    await onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="card">
      <div className="card-header">
        <h2 className="card-title">Dados do Número da Sorte</h2>
        <p className="card-subtitle">
          Preencha as informações para cadastrar ou editar um número da sorte.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações Gerais */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Detalhes do Número
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número */}
            <div className="form-group">
              <label htmlFor="number" className="form-label">
                Número da Sorte <span className="text-red-500">*</span>
              </label>
              <input
                {...register("number", {
                  valueAsNumber: true, // Converte automaticamente para number
                })}
                type="number"
                id="number"
                className={`form-input ${
                  errors.number ? "border-red-300" : ""
                }`}
                placeholder="Ex: 123456"
                min="1"
              />
              {errors.number && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.number.message}
                </p>
              )}
            </div>

            {/* ID Fatura */}
            <div className="form-group">
              <label htmlFor="invoiceId" className="form-label">
                ID da Fatura <span className="text-red-500">*</span>
              </label>
              <input
                {...register("invoiceId", {
                  valueAsNumber: true, // Converte automaticamente para number
                })}
                type="number"
                id="invoiceId"
                className={`form-input ${
                  errors.invoiceId ? "border-red-300" : ""
                }`}
                placeholder="ID da fatura associada"
                min="1"
              />
              {errors.invoiceId && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.invoiceId.message}
                </p>
              )}
            </div>

            {/* Winner At */}
            <div className="form-group">
              <label htmlFor="winnerAt" className="form-label">
                Ganhador Em
              </label>
              <input
                {...register("winnerAt")}
                type="datetime-local"
                id="winnerAt"
                className={`form-input ${
                  errors.winnerAt ? "border-red-300" : ""
                }`}
              />
              {errors.winnerAt && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.winnerAt.message}
                </p>
              )}
            </div>

            {/* Email Sended At */}
            <div className="form-group">
              <label htmlFor="emailSendedAt" className="form-label">
                Email Enviado Em
              </label>
              <input
                {...register("emailSendedAt")}
                type="datetime-local"
                id="emailSendedAt"
                className={`form-input ${
                  errors.emailSendedAt ? "border-red-300" : ""
                }`}
              />
              {errors.emailSendedAt && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.emailSendedAt.message}
                </p>
              )}
            </div>

            {/* Checkbox Ativo */}
            <div className="form-group md:col-span-2">
              <label
                htmlFor="active"
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  {...register("active")}
                  type="checkbox"
                  id="active"
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
              <p className="form-help">
                Marque esta opção se o número da sorte está ativo.
              </p>
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
          Salvar Número da Sorte
        </button>
      </div>
    </form>
  );
}
