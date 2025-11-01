import { ClipboardList, Users, Package, Gift } from "lucide-react";
import { AlertCircle, Loader } from "lucide-react";
import useDashboard from "../hooks/useDashboard"; // Importa o hook

export default function Dashboard() {
  const { stats, isLoading, error } = useDashboard(); // Usa o hook para obter os dados

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error max-w-lg">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Visão geral do sistema e métricas principais
        </p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary-100 text-primary-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-value pr-2">
              {(stats?.incompleteClients || 0) +
                (stats?.completeClients || 0)}
            </span>
            <span className="stat-label">Clientes Totais</span>
          </div>
          <div>
            <span className="stat-value pr-2">
              {stats?.incompleteClients || 0}
            </span>
            <span className="stat-label">Incompletos</span>
          </div>
          <div>
            <span className="stat-value pr-2">
              {stats?.completeClients || 0}
            </span>
            <span className="stat-label">Completos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-value pr-2">{stats?.totalInvoices ?? 0}</span>
            <span className="stat-label">Notas Fiscais</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-yellow-100 text-yellow-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-value pr-2">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalInvoiceValue ?? 0)}</span>
            <span className="stat-label">Valor Total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-100 text-red-600">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-value pr-2">{stats?.drawnVouchers ?? 0}</span>
            <span className="stat-label">Vouchers Sorteados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
