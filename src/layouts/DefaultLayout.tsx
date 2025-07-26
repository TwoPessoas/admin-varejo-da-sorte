import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react'; // Ícones para o menu

const DefaultLayout = () => {
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    return (
        <div className="relative flex min-h-screen bg-gray-100">
            {/* Overlay para o menu mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* --- Sidebar --- */}
            <aside 
                className={`absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                           md:relative md:translate-x-0 
                           w-64 bg-gray-800 text-white p-4 
                           transition-transform duration-300 ease-in-out z-30`}
            >
                <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
                <nav>
                    <Link to="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Dashboard</Link>
                    {/* Futuros links:
                    <Link to="/clientes" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Clientes</Link>
                    <Link to="/produtos" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">Produtos</Link> 
                    */}
                </nav>
            </aside>
            
            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col">
                <header className="flex justify-between items-center h-16 bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                    {/* Botão Hambúrguer (só aparece em mobile) */}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none md:hidden">
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    
                    {/* Espaçador para centralizar o botão de logout no mobile */}
                    <div className="md:hidden"></div>
                    
                    {/* Botão de Logout */}
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        Logout
                    </button>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <Outlet /> {/* O conteúdo da página atual será renderizado aqui */}
                </main>
            </div>
        </div>
    );
};

export default DefaultLayout;