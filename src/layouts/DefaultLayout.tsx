// src/layouts/DefaultLayout.tsx
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  FileText,
  Briefcase,
  Hash,
  Gift,
  Package,
  FileCode,
  Menu,
  LogOut,
  X,
  Home,
} from "lucide-react";

const DefaultLayout = () => {
  const { logout } = useAuth(); // Utiliza o método logout do contexto
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Estado para controle da sidebar no mobile

  // Alternar visibilidade da sidebar no mobile
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Rotas da sidebar
  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Clientes",
      path: "/clients",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Notas Fiscais",
      path: "/notas-fiscais",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Oportunidades",
      path: "/opportunities",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      name: "Números da Sorte",
      path: "/draw-numbers",
      icon: <Hash className="w-5 h-5" />,
    },
    { name: "Vouchers", path: "/vouchers", icon: <Gift className="w-5 h-5" /> },
    {
      name: "Produtos",
      path: "/produtos",
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: "Conteúdo de Página",
      path: "/conteudo-pagina",
      icon: <FileCode className="w-5 h-5" />,
    },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div
        className={`app-sidebar ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="sidebar-header flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Varejo da Sorte
          </h2>
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links da sidebar */}
        <div className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="nav-item flex items-center space-x-2"
              onClick={() => setSidebarOpen(false)} // Fecha a sidebar em dispositivos móveis
            >
              {link.icon}
              <span className="nav-text">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Footer da sidebar */}
        <div className="sidebar-footer">
          <button
            className="nav-item w-full flex items-center text-left space-x-2 text-red-600 hover:text-red-800"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span className="nav-text">Sair</span>
          </button>
        </div>
      </div>

      {/* Overlay para dispositivos móveis (fecha a sidebar) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="app-main">
        {/* Header */}
        <div className="app-header">
          <div className="header-content flex items-center justify-between">
            {/* Botão para abrir a sidebar no mobile */}
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200"
              onClick={toggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <div>
              <button className="btn btn-danger btn-sm" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Página carregada */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
