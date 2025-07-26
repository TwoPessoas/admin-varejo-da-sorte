import { useProducts, type Product } from '../../hooks/useProducts';
import { PlusCircle, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductListPage = () => {
  const {
    products,
    isLoading,
    error,
    page,
    totalPages,
    searchTerm,
    setPage,
    setSearchTerm,
  } = useProducts();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reseta para a primeira página ao buscar
  };

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-2 mt-4 text-text-primary">
      <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"><ChevronsLeft size={20} /></button>
      <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"><ChevronLeft size={20} /></button>
      <span className="font-semibold">Página {page} de {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"><ChevronRight size={20} /></button>
      <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-secondary disabled:opacity-50"><ChevronsRight size={20} /></button>
    </div>
  );

  return (
    <div>
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Produtos</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Campo de Busca */}
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-primary border border-secondary rounded-md py-2 pl-10 pr-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {/* Botão de Novo Produto */}
          <Link
            to="/products/new"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors"
          >
            <PlusCircle size={20} />
            Novo Produto
          </Link>
        </div>
      </div>

      {/* Conteúdo Principal (Tabela ou Mensagens) */}
      <div className="bg-primary rounded-lg shadow-md overflow-x-auto">
        {isLoading ? (
          <p className="p-6 text-center text-text-secondary">Carregando produtos...</p>
        ) : error ? (
          <p className="p-6 text-center text-danger">{error}</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-center text-text-secondary">Nenhum produto encontrado.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-secondary">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Estoque</th>
                <th className="p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: Product) => (
                <tr key={product.id} className="border-b border-secondary hover:bg-secondary/50">
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    {/* Futuros botões de ação */}
                    <button className="text-accent hover:underline">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Paginação */}
      {!isLoading && !error && products.length > 0 && renderPagination()}
    </div>
  );
};

export default ProductListPage;