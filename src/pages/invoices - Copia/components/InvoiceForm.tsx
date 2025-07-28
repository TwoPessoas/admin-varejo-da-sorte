// src/components/InvoiceForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react";
import { InputMask } from "@react-input/mask";

/**
 * Esquema de validação Zod para os dados da fatura.
 * Inclui todos os campos da entidade Invoice que podem ser visualizados ou editados,
 * mesmo que nem todos sejam enviados diretamente na criação (onde o backend complementa).
 */
const invoiceSchema = z.object({
  // Campos essenciais para criação/identificação
  fiscalCode: z.string().nonempty("O Código Fiscal é obrigatório."),
  // `z.coerce.number()` é usado porque o select retorna uma string que precisa ser convertida para número.
  clientId: z
    .number({ error: "Selecione um cliente válido." })
    .int("O ID do cliente deve ser um número inteiro.")
    .positive("O ID do cliente deve ser um número positivo.")
    .min(1, "O Cliente é obrigatório."), // Garante que 0 (que pode vir de coerce de vazio) não seja válido

  // Campos adicionais que podem ser preenchidos automaticamente na criação
  // ou que seriam editáveis se a rota PUT de fatura estivesse ativa.
  // Usamos `optional().nullable()` para permitir que esses campos sejam vazios ou nulos.
  invoceValue: z
    .number()
    .min(0, "O valor deve ser positivo.")
    .optional()
    .nullable(),
  hasItem: z.boolean().optional(),
  hasCreditcard: z.boolean().optional(),
  hasPartnerCode: z.boolean().optional(),
  pdv: z
    .number()
    .int("PDV deve ser um número inteiro.")
    .min(0, "PDV deve ser um número positivo.")
    .optional(),
  store: z
    .number()
    .int("Loja deve ser um número inteiro.")
    .min(0, "Loja deve ser um número positivo.")
    .optional(),
  numCoupon: z
    .number()
    .int("Número do Cupom deve ser um número inteiro.")
    .min(0, "Número do Cupom deve ser um número positivo.")
    .optional(),
  // CNPJ é tratado como string devido à sua formatação e tratamento no backend.
  cnpj: z.string().optional().nullable(),
  creditcard: z.string().optional().nullable(),
});

/**
 * Tipo inferido do esquema Zod para uso com React Hook Form.
 */
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

/**
 * Propriedades para o componente InvoiceForm.
 */
interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormValues>; // Valores iniciais para preencher o formulário (modo edição)
  onSubmit: (data: InvoiceFormValues) => Promise<void>; // Função chamada ao submeter o formulário
  isLoading?: boolean; // Estado de carregamento para desabilitar o botão de submit
  clients: { id: number; name: string }[]; // Lista de clientes para o campo select
}

/**
 * Componente de formulário para criação e edição de faturas.
 *
 * @param {InvoiceFormProps} props As propriedades do componente.
 * @returns {JSX.Element} O componente do formulário de fatura.
 */
export default function InvoiceForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  clients,
}: InvoiceFormProps) {
  // `isEditing` é verdadeiro se `initialValues.fiscalCode` existe, indicando modo de edição.
  // Caso contrário, é modo de criação.
  const isEditing = !!initialValues.fiscalCode;

  const {
    register,
    handleSubmit,
    setValue, // Usado para atualizar valores de campos mascarados
    formState: { errors }, // Erros de validação do formulário
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      // Garante que os valores iniciais sejam definidos corretamente.
      // `?? ''` para strings e `?? undefined` para números/booleanos opcionais.
      fiscalCode: initialValues.fiscalCode || "",
      clientId: initialValues.clientId || undefined, // O select espera string para `value`
      invoceValue: initialValues.invoceValue ?? undefined,
      hasItem: initialValues.hasItem ?? false,
      hasCreditcard: initialValues.hasCreditcard ?? false,
      hasPartnerCode: initialValues.hasPartnerCode ?? false,
      pdv: initialValues.pdv ?? undefined,
      store: initialValues.store ?? undefined,
      numCoupon: initialValues.numCoupon ?? undefined,
      cnpj: initialValues.cnpj ?? "",
      creditcard: initialValues.creditcard ?? "",
    },
  });

  // Lida com a mudança no campo CNPJ, limpando caracteres não numéricos
  // antes de definir o valor para React Hook Form.
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e.target.value.replace(/[^0-9]/g, ""); // Remove tudo que não for dígito
    setValue("cnpj", cleanedValue || null, { shouldValidate: true }); // Define null se vazio
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <div className="card-header">
        <h2 className="card-title">
          {isEditing
            ? `Editar Fatura: ${initialValues.fiscalCode}`
            : "Nova Fatura"}
        </h2>
        <p className="card-subtitle">
          Preencha as informações para cadastrar uma nova fatura ou editar uma
          existente.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações Essenciais da Fatura */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Dados Essenciais
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código Fiscal */}
            <div className="form-group">
              <label htmlFor="fiscalCode" className="form-label">
                Código Fiscal <span className="text-red-500">*</span>
              </label>
              <input
                {...register("fiscalCode")}
                type="text"
                id="fiscalCode"
                className={`form-input ${
                  errors.fiscalCode ? "border-red-300" : ""
                }`}
                placeholder="Ex: 00000000000000000000000000000000000000000000"
                readOnly={isEditing} // Código Fiscal é readOnly no modo de edição
              />
              {errors.fiscalCode && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.fiscalCode.message}
                </p>
              )}
            </div>

            {/* Cliente (Select) */}
            <div className="form-group">
              <label htmlFor="clientId" className="form-label">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                {...register("clientId")}
                id="clientId"
                className={`form-input ${
                  errors.clientId ? "border-red-300" : ""
                }`}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.clientId.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Agrupamento: Detalhes Adicionais da Fatura */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Outros Detalhes (Visão Geral ou Edição Futura)
          </legend>
          <p className="text-sm text-gray-600 mb-4">
            Na criação de uma nova fatura, os campos abaixo são geralmente
            preenchidos automaticamente pelo sistema após o processamento do
            Código Fiscal. Eles estão aqui para visualização ou para serem
            editados caso a funcionalidade de atualização de faturas seja
            ativada no backend.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Valor da Fatura */}
            <div className="form-group">
              <label htmlFor="invoceValue" className="form-label">
                Valor da Fatura
              </label>
              <input
                {...register("invoceValue")}
                type="number"
                step="0.01"
                id="invoceValue"
                className={`form-input ${
                  errors.invoceValue ? "border-red-300" : ""
                }`}
                placeholder="0.00"
                readOnly={!isEditing} // Somente leitura se não estiver editando
                disabled={!isEditing} // Desabilita se somente leitura
              />
              {errors.invoceValue && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.invoceValue.message}
                </p>
              )}
            </div>

            {/* PDV */}
            <div className="form-group">
              <label htmlFor="pdv" className="form-label">
                PDV
              </label>
              <input
                {...register("pdv")}
                type="number"
                id="pdv"
                className={`form-input ${errors.pdv ? "border-red-300" : ""}`}
                placeholder="Ponto de Venda"
                readOnly={!isEditing}
                disabled={!isEditing}
              />
              {errors.pdv && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.pdv.message}
                </p>
              )}
            </div>

            {/* Loja */}
            <div className="form-group">
              <label htmlFor="store" className="form-label">
                Loja
              </label>
              <input
                {...register("store")}
                type="number"
                id="store"
                className={`form-input ${errors.store ? "border-red-300" : ""}`}
                placeholder="Número da Loja"
                readOnly={!isEditing}
                disabled={!isEditing}
              />
              {errors.store && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.store.message}
                </p>
              )}
            </div>

            {/* Número do Cupom */}
            <div className="form-group">
              <label htmlFor="numCoupon" className="form-label">
                Número do Cupom
              </label>
              <input
                {...register("numCoupon")}
                type="number"
                id="numCoupon"
                className={`form-input ${
                  errors.numCoupon ? "border-red-300" : ""
                }`}
                placeholder="Número do Cupom Fiscal"
                readOnly={!isEditing}
                disabled={!isEditing}
              />
              {errors.numCoupon && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.numCoupon.message}
                </p>
              )}
            </div>

            {/* CNPJ */}
            <div className="form-group">
              <label htmlFor="cnpj" className="form-label">
                CNPJ
              </label>
              <InputMask
                type="text"
                mask="##.###.###/####-##" // Máscara para CNPJ
                replacement={{ "#": /\d/ }}
                placeholder="99.999.999/9999-99"
                {...register("cnpj")}
                onChange={handleCnpjChange} // Usa o handler personalizado para InputMask
                className={`form-input ${errors.cnpj ? "border-red-300" : ""}`}
                defaultValue={initialValues.cnpj || ""} // Garante que o valor inicial seja aplicado
                readOnly={!isEditing}
                disabled={!isEditing}
              />
              {errors.cnpj && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.cnpj.message}
                </p>
              )}
            </div>

            {/* Cartão de Crédito (String) */}
            <div className="form-group">
              <label htmlFor="creditcard" className="form-label">
                Informação de Cartão de Crédito
              </label>
              <input
                {...register("creditcard")}
                type="text"
                id="creditcard"
                className={`form-input ${
                  errors.creditcard ? "border-red-300" : ""
                }`}
                placeholder="Ex: Visa, Mastercard"
                readOnly={!isEditing}
                disabled={!isEditing}
              />
              {errors.creditcard && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.creditcard.message}
                </p>
              )}
            </div>

            {/* Checkbox: Possui Item */}
            <div className="form-group col-span-full md:col-span-1">
              <label
                htmlFor="hasItem"
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  {...register("hasItem")}
                  type="checkbox"
                  id="hasItem"
                  className="form-checkbox"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Fatura possui item associado
                </span>
              </label>
            </div>

            {/* Checkbox: Possui Cartão de Crédito */}
            <div className="form-group col-span-full md:col-span-1">
              <label
                htmlFor="hasCreditcard"
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  {...register("hasCreditcard")}
                  type="checkbox"
                  id="hasCreditcard"
                  className="form-checkbox"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Fatura paga com cartão de crédito
                </span>
              </label>
            </div>

            {/* Checkbox: Possui Código de Parceiro */}
            <div className="form-group col-span-full md:col-span-1">
              <label
                htmlFor="hasPartnerCode"
                className="inline-flex items-center cursor-pointer"
              >
                <input
                  {...register("hasPartnerCode")}
                  type="checkbox"
                  id="hasPartnerCode"
                  className="form-checkbox"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
                <span className="ml-2 text-sm text-gray-700">
                  Fatura possui código de parceiro
                </span>
              </label>
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
          {isEditing ? "Atualizar Fatura" : "Criar Fatura"}
        </button>
      </div>
    </form>
  );
}
