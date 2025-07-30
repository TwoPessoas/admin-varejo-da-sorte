import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Check, XCircle } from "lucide-react";

// Esquema de validação Zod para os dados do produto
const productSchema = z.object({
  // EAN: Obrigatório, 13 dígitos numéricos, transformado em número para o backend
  ean: z
    .string()
    .nonempty("O EAN é obrigatório")
    .regex(/^\d{13}$/, "O EAN deve conter exatamente 13 dígitos numéricos."),
  description: z.string().optional(), // Descrição é opcional
  brand: z.string().optional(), // Marca é opcional
});

// Tipo TypeScript inferido do esquema Zod para os valores do formulário
type ProductFormValues = z.infer<typeof productSchema>;

// Propriedades do componente ProductForm
interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>; // Valores iniciais para o formulário (usado na edição)
  onSubmit: (data: ProductFormValues) => Promise<void>; // Função chamada ao submeter o formulário
  isLoading?: boolean; // Estado de carregamento para desabilitar o formulário e mostrar feedback
}

export default function ProductForm({
  initialValues = {}, // Define um objeto vazio como padrão para initialValues
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const {
    register, // Função para registrar os inputs no react-hook-form
    handleSubmit, // Função para lidar com o submit do formulário
    formState: { errors }, // Objeto contendo os erros de validação
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema), // Integra o Zod para validação
    defaultValues: initialValues, // Define os valores iniciais do formulário
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)} // O handleSubmit envolve a sua função onSubmit para gerenciar a validação
      className="card" // Aplica o estilo de cartão para consistência visual
    >
      <div className="card-header">
        <h2 className="card-title">Dados do Produto</h2>
        <p className="card-subtitle">
          Preencha as informações para cadastrar ou editar um produto.
        </p>
      </div>

      <div className="card-body">
        {/* Agrupamento: Informações do Produto */}
        <fieldset className="border-t border-gray-200 pt-4 mb-6">
          <legend className="text-lg font-semibold text-gray-800 mb-4">
            Informações do Produto
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo EAN */}
            <div className="form-group">
              <label htmlFor="ean" className="form-label">
                EAN <span className="text-red-500">*</span>{" "}
                {/* Indicador de campo obrigatório */}
              </label>
              <input
                {...register("ean")} // Registra o input com o react-hook-form
                type="text" // Tipo texto para EAN, para evitar problemas com números grandes ou formatação
                id="ean"
                className={`form-input ${errors.ean ? "border-red-300" : ""}`} // Adiciona borda vermelha se houver erro
                placeholder="Ex: 7891234567890" // Exemplo de formato EAN-13
              />
              {errors.ean && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.ean.message as string}{" "}
                  {/* Exibe a mensagem de erro */}
                </p>
              )}
            </div>

            {/* Campo Descrição */}
            <div className="form-group md:col-span-2">
              {/* Ocupa duas colunas em telas médias para melhor visualização */}
              <label htmlFor="description" className="form-label">
                Descrição
              </label>
              <input
                {...register("description")}
                type="text"
                id="description"
                className={`form-input ${
                  errors.description ? "border-red-300" : ""
                }`}
                placeholder="Descrição completa do produto (Ex: Smartphone XYZ 128GB)"
              />
              {errors.description && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.description.message as string}
                </p>
              )}
            </div>

            {/* Campo Marca */}
            <div className="form-group">
              <label htmlFor="brand" className="form-label">
                Marca
              </label>
              <input
                {...register("brand")}
                type="text"
                id="brand"
                className={`form-input ${errors.brand ? "border-red-300" : ""}`}
                placeholder="Nome da marca (Ex: TechCorp)"
              />
              {errors.brand && (
                <p className="form-error flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />{" "}
                  {errors.brand.message as string}
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
          disabled={isLoading} // Desabilita o botão enquanto isLoading for true
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin mr-2" /> // Ícone de carregamento
          ) : (
            <Check className="w-5 h-5 mr-2" /> // Ícone de sucesso
          )}
          Salvar Produto {/* Texto do botão */}
        </button>
      </div>
    </form>
  );
}
