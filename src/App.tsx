import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AuthProvider>
        {/* O Outlet renderizará os layouts (DefaultLayout ou GuestLayout) 
          que, por sua vez, renderizarão as páginas. */}
        <Outlet />
      </AuthProvider>
      <Toaster />
    </>
  );
}

export default App;
