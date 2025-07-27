// src/components/ClientForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check } from "lucide-react";
import { InputMask } from "@react-input/mask";

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
  initialValues?: Partial<ClientFormValues>; // Valores iniciais do formulário
  onSubmit: (data: ClientFormValues) => Promise<void>; // Função chamada no submit
  isLoading?: boolean; // Estado de carregamento
}

export default function ClientForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialValues,
  });

  return (
    <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white shadow rounded-lg p-6"
      >
        {/* Nome */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Nome
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className={`form-input ${errors.name ? "border-red-300" : ""}`}
            placeholder="Nome do cliente"
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        {/* CPF */}
        <div className="form-group">
          <label htmlFor="cpf" className="form-label">
            CPF
          </label>
          <InputMask
            type="tel"
            mask="___.___.___-__"
            replacement={{ _: /\d/ }}
            placeholder="Digite o CPF"
            {...register("cpf")}
            onChange={(e) => setValue("cpf", e.target.value)} // Atualiza o valor no React Hook Form
            className={`form-input ${errors.cpf ? "border-red-300" : ""}`}
          />
          {errors.cpf && <p className="form-error">{errors.cpf.message}</p>}
        </div>

        {/* Data de Nascimento */}
        <div className="form-group">
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

        {/* Celular */}
        <div className="form-group">
          <label htmlFor="cel" className="form-label">
            Celular
          </label>
          <InputMask
            type="tel"
            mask="(__) _____-____"
            replacement={{ _: /\d/ }}
            {...register("cel")}
            id="cel"
            className="form-input"
            placeholder="Número de celular"
          />
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
            placeholder="E-mail do cliente"
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        {/* Checkbox Pré-Cadastro */}
        <div className="form-group">
          <label htmlFor="isPreRegister" className="inline-flex items-center">
            <input
              {...register("isPreRegister")}
              type="checkbox"
              id="isPreRegister"
              className="form-checkbox"
            />
            <span className="ml-2 text-sm">Cliente em pré-cadastro</span>
          </label>
        </div>

        {/* Botão de Enviar */}
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
      </form>
  );
}
