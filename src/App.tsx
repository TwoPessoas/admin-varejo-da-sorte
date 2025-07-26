import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* O Outlet renderizará os layouts (DefaultLayout ou GuestLayout) 
          que, por sua vez, renderizarão as páginas. */}
      <Outlet />
    </AuthProvider>
  );
}

export default App;