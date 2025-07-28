import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react"; // Adicionado XCircle para feedback de erro
import { InputMask } from "@react-input/mask";

// Esquema de validação Zod para os dados do cliente
const clientSchema = z.object({
  name: z.string().nonempty("O nome é obrigatório"),
  cpf: z
    .string()
    .nonempty("O CPF é obrigatório")
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      "O CPF deve estar no formato 999.999.999-99."
    ),
  birthday: z.string().optional(),
  cel: z.string().optional(),
  email: z.email("E-mail inválido").optional(),
  isPreRegister: z.boolean(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialValues?: Partial<ClientFormValues>; // Valores iniciais do formulário para edição
  onSubmit: (data: ClientFormValues) => Promise<void>; // Função chamada no submit
  isLoading?: boolean; // Estado de carregamento para o botão de submit
}

export default function ClientForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue, // Usado para atualizar o valor do campo CPF e Celular após a máscara
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card" // Utiliza a classe 'card' para a consistência visual
    >
      <div className="card-header">
        <h2 className="card-title">Dados do Cliente</h2>
        <p className="card-subtitle">
          Preencha as informações para cadastrar ou editar um cliente.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações Pessoais */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Informações Pessoais
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                id="name"
                className={`form-input ${errors.name ? "border-red-300" : ""}`}
                placeholder="Nome completo do cliente"
              />
              {errors.name && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.name.message}
                </p>
              )}
            </div>

            {/* CPF */}
            <div className="form-group">
              <label htmlFor="cpf" className="form-label">
                CPF <span className="text-red-500">*</span>
              </label>
              <InputMask
                type="tel" // Alterado para text, pois tel pode ter comportamento diferente em alguns browsers
                mask="___.___.___-__"
                replacement={{ _: /\d/ }}
                placeholder="999.999.999-99"
                {...register("cpf")}
                onChange={(e) => setValue("cpf", e.target.value)} // Atualiza o valor no React Hook Form
                className={`form-input ${errors.cpf ? "border-red-300" : ""}`}
                defaultValue={initialValues.cpf} // Garante que a máscara seja aplicada ao valor inicial
              />
              {errors.cpf && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.cpf.message}
                </p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div className="form-group md:col-span-2">
              {" "}
              {/* Ocupa 2 colunas em telas médias */}
              <label htmlFor="birthday" className="form-label">
                Data de Nascimento
              </label>
              <input
                {...register("birthday")}
                type="date"
                id="birthday"
                className="form-input"
              />
            </div>
          </div>
        </fieldset>

        {/* Agrupamento: Informações de Contato */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Informações de Contato
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Celular */}
            <div className="form-group">
              <label htmlFor="cel" className="form-label">
                Celular
              </label>
              <InputMask
                type="tel" // Alterado para text
                mask="(__) _____-____"
                replacement={{ _: /\d/ }}
                {...register("cel")}
                id="cel"
                className="form-input"
                placeholder="(99) 99999-9999"
                onChange={(e) => setValue("cel", e.target.value)}
                defaultValue={initialValues.cel}
              />
              {errors.cel && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.cel.message}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className={`form-input ${errors.email ? "border-red-300" : ""}`}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Checkbox Pré-Cadastro */}
        <div className="form-group">
          <label
            htmlFor="isPreRegister"
            className="inline-flex items-center cursor-pointer"
          >
            <input
              {...register("isPreRegister")}
              type="checkbox"
              id="isPreRegister"
              className="form-checkbox"
            />
            <span className="ml-2 text-sm text-gray-700">
              Cliente em pré-cadastro
            </span>
          </label>
          <p className="form-help">
            Marque esta opção se o cliente ainda não é formalmente ativo ou está
            em processo de onboarding.
          </p>
        </div>
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
          Salvar Cliente
        </button>
      </div>
    </form>
  );
}
