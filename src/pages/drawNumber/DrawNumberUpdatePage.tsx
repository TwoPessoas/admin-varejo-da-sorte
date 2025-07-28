// src/pages/DrawNumberUpdatePage.tsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, XCircle } from "lucide-react";
import useDrawNumber from "../../hooks/useDrawNumber";
import DrawNumberForm from "./components/DrawNumberForm";

// Interface para os valores do formulário (compatível com DrawNumberFormValues no DrawNumberForm)
interface DrawNumberFormValues {
  number: number;
  invoiceId: number;
  active?: boolean;
  winnerAt?: string | null;
  emailSendedAt?: string | null;
}

export default function DrawNumberUpdatePage() {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const navigate = useNavigate();

  // Desestruturando as funções e estados relevantes do useDrawNumber
  // isUpdatingDrawNumber é o isLoading do useDrawNumber quando uma operação de update está em curso
  const {
    getDrawNumber,
    updateDrawNumber,
    isLoading: isUpdatingDrawNumber,
  } = useDrawNumber();

  // Estados locais para gerenciar o carregamento e os dados do número da sorte para o formulário
  const [initialDrawNumberData, setInitialDrawNumberData] =
    useState<Partial<DrawNumberFormValues> | null>(null);
  const [isFetchingDrawNumber, setIsFetchingDrawNumber] = useState(true); // Estado de carregamento para a busca inicial
  const [fetchDrawNumberError, setFetchDrawNumberError] = useState<
    string | null
  >(null); // Estado de erro para a busca inicial

  // Efeito para buscar os dados do número da sorte ao carregar a página ou mudar o ID
  useEffect(() => {
    const fetchCurrentDrawNumber = async () => {
      if (!id) {
        setFetchDrawNumberError("ID do número da sorte não fornecido na URL.");
        setIsFetchingDrawNumber(false);
        return;
      }

      setIsFetchingDrawNumber(true);
      setFetchDrawNumberError(null); // Limpa erros anteriores de busca
      setInitialDrawNumberData(null); // Limpa dados anteriores

      try {
        const drawNumber = await getDrawNumber(Number(id)); // Chama o getDrawNumber do hook
        if (drawNumber) {
          // Prepara os dados para o formulário (o DrawNumberForm já lida com a formatação das datas)
          setInitialDrawNumberData({
            number: drawNumber.number,
            invoiceId: drawNumber.invoiceId,
            active: drawNumber.active,
            winnerAt: drawNumber.winnerAt,
            emailSendedAt: drawNumber.emailSendedAt,
          });
        } else {
          setFetchDrawNumberError(
            "Número da sorte não encontrado ou erro ao buscar dados."
          );
        }
      } catch (err: any) {
        console.error("Erro ao buscar número da sorte:", err);
        setFetchDrawNumberError(
          "Falha ao carregar os dados do número da sorte. Por favor, tente novamente."
        );
      } finally {
        setIsFetchingDrawNumber(false);
      }
    };

    fetchCurrentDrawNumber();
  }, [id, getDrawNumber]); // Adiciona getDrawNumber nas dependências

  // Lidar com a submissão do formulário de atualização
  const handleUpdate = useCallback(
    async (data: DrawNumberFormValues) => {
      if (!id) {
        setFetchDrawNumberError(
          "Não foi possível atualizar: ID do número da sorte não encontrado."
        );
        return;
      }
      // O useDrawNumber já dispara toasts de sucesso/erro para o updateDrawNumber
      const updatedDrawNumber = await updateDrawNumber(Number(id), data);
      if (updatedDrawNumber) {
        navigate("/draw-numbers"); // Navega para a listagem após o sucesso
      }
      // Se updatedDrawNumber for null, o toast.error já foi disparado pelo useDrawNumber
    },
    [id, updateDrawNumber, navigate]
  );

  // Exibição de estado de carregamento inicial
  if (isFetchingDrawNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-3 text-lg text-gray-700">
          Carregando dados do número da sorte...
        </p>
      </div>
    );
  }

  // Exibição de erro na busca inicial do número da sorte
  if (fetchDrawNumberError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Erro ao carregar número da sorte
        </h2>
        <p className="text-gray-600 text-center mb-6">{fetchDrawNumberError}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/draw-numbers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de números da sorte
        </button>
      </div>
    );
  }

  // Se initialDrawNumberData é null após o carregamento (por exemplo, ID não encontrado)
  if (!initialDrawNumberData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Número da sorte não encontrado
        </h2>
        <p className="text-gray-600 text-center mb-6">
          O ID fornecido não corresponde a nenhum número da sorte.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/draw-numbers")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a lista de números da sorte
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
          onClick={() => navigate("/draw-numbers")}
          disabled={isUpdatingDrawNumber} // Desabilita o botão enquanto a atualização está em andamento
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <h1 className="page-title">Atualizar Número da Sorte</h1>
      </div>

      {/* Formulário de Atualização */}
      <DrawNumberForm
        initialValues={initialDrawNumberData} // Passa os dados do número da sorte carregados
        onSubmit={handleUpdate} // Função para lidar com a atualização
        isLoading={isUpdatingDrawNumber} // Passa o estado de carregamento do updateDrawNumber
      />
    </div>
  );
}
