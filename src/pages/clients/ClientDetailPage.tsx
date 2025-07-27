import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, ArrowLeft } from 'lucide-react';
import useClient from '../../hooks/useClient';
import DateUtils from '../../utils/dateUtils';


export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>(); // Obtemos o ID da rota
  const { getClient, isLoading, error } = useClient();
  const [client, setClient] = useState<any>(null);
  const navigate = useNavigate();

  // Busca os dados ao carregar a página
  useEffect(() => {
    const fetchClient = async () => {
      if (id) {
        const data = await getClient(Number(id));
        setClient(data);
        console.log('Dados do cliente:', data);
      }
    };

    fetchClient();
  }, [id]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error max-w-lg">
          <p className="text-sm">Erro ao carregar os detalhes do cliente. Tente novamente.</p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Cliente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="page-header flex justify-between items-center">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/clients')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a Lista
        </button>
        <h1 className="page-title">Detalhes do Cliente</h1>
      </div>

      {/* Informações do Cliente */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{client.name || 'Cliente Sem Nome'}</h3>
          <p className="card-subtitle text-sm text-gray-600">ID: {client.id}</p>
        </div>
        <div className="card-body space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">CPF</h4>
            <p className="text-gray-800">{client.cpf}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Data de Nascimento</h4>
            <p className="text-gray-800">{client.birthday ? new Date(client.birthday).toLocaleDateString() : 'Não informado'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Celular</h4>
            <p className="text-gray-800">{client.cel || 'Não informado'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">E-mail</h4>
            <p className="text-gray-800">{client.email || 'Não informado'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Pré-cadastro</h4>
            <p className={`text-sm font-medium ${client.isPreRegister ? 'text-green-600' : 'text-gray-500'}`}>
              {client.isPreRegister ? 'Sim' : 'Não'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Ganhador Mega</h4>
            <p className={`text-sm font-medium ${client.isMegaWinner ? 'text-yellow-600' : 'text-gray-500'}`}>
              {client.isMegaWinner ? 'Sim' : 'Não'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Criação</h4>
            <p className="text-gray-800">{DateUtils.toDateTimePtBr(client.createdAt)}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Última Atualização</h4>
            <p className="text-gray-800">{DateUtils.toDateTimePtBr(client.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}