// src/pages/DrawNumberCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useDrawNumber from "../../hooks/useDrawNumber";
import DrawNumberForm from "./components/DrawNumberForm";

export default function DrawNumberCreatePage() {
  const { createDrawNumber, isLoading } = useDrawNumber(); // isLoading aqui se refere ao estado do createDrawNumber
  const navigate = useNavigate();

  // Lidar com o envio do formulário
  const handleCreate = async (data: any) => {
    // A função createDrawNumber já exibe toasts de sucesso/erro
    const newDrawNumber = await createDrawNumber(data);
    if (newDrawNumber) {
      navigate("/draw-numbers"); // Redireciona para a listagem após a criação bem-sucedida
    }
    // Se newDrawNumber for null, significa que houve um erro e o toast já foi exibido pelo hook
  };

  return (
    <div className="space-y-8 p-4 lg:p-6">
      {/* Cabeçalho da Página */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/draw-numbers")}
          disabled={isLoading} // Desabilita o botão enquanto a criação está em andamento
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Novo Número da Sorte</h1>
      </div>

      {/* Formulário Reutilizável */}
      <DrawNumberForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
