import { useEffect, useState } from 'react';
import useClient from '../../hooks/useClient';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Trash2, FileText, Loader, Plus, Download, XCircle } from 'lucide-react';

export default function ClientListPage() {
  const { clients, fetchClients, deleteClient, isLoading, error } = useClient();
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    cpf: '',
    cel: '',
  });
  const [deletingClient, setDeletingClient] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const navigate = useNavigate();

  // Fetch clients on initial render or when filters change
  useEffect(() => {
    fetchClients({
      page: 1,
      limit: 10,
      search: filters.name, // Example search by name; adapt it for other fields
    });
  }, [filters]);

  // Handle delete client
  const handleDelete = async () => {
    if (deletingClient) {
      const success = await deleteClient(deletingClient);
      if (success) {
        fetchClients(); // Refetch clients after deletion
      }
      setDeletingClient(null); // Close modal
    }
  };

  // Handle export (simulated functionality here)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
      alert('Clientes exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center">
        <h1 className="page-title">Lista de Clientes</h1>
        <div className="flex space-x-4">
          {/* Novo Cliente */}
          <button
            className="btn btn-primary"
            onClick={() => navigate('/clients/new')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </button>

          {/* Exportar */}
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Exportar
          </button>
        </div>
      </div>

      {/* Handle Errors */}
      {error && (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabela de Clientes */}
      <div className="table-container">
        <table className="table">
          {/* Cabeçalho da Tabela */}
          <thead>
            <tr>
              <th className='w-10'>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Celular</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Filtros */}
            <tr>
              <td>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filtrar ID"
                  value={filters.id}
                  onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filtrar Nome"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filtrar CPF"
                  value={filters.cpf}
                  onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filtrar Celular"
                  value={filters.cel}
                  onChange={(e) => setFilters({ ...filters, cel: e.target.value })}
                />
              </td>
              <td></td>
            </tr>

            {/* Lista de Clientes */}
            {!isLoading && clients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>{client.cpf}</td>
                <td>{client.cel}</td>
                <td>
                  <div className="flex space-x-2">
                    {/* Link para Notas Fiscais */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/notas-fiscais?client_id=${client.id}`)}
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Ver Detalhes */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Atualizar */}
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => navigate(`/clients/${client.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Deletar */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeletingClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Confirmar Exclusão */}
      {deletingClient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            </div>
            <div className="modal-body">
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir o cliente de ID <strong>{deletingClient}</strong>? Essa ação não pode ser desfeita!
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingClient(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}