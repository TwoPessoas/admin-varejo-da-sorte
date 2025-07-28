import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App"; // 1. Importe o novo componente App
import DefaultLayout from "../layouts/DefaultLayout";
import GuestLayout from "../layouts/GuestLayout";
import ProtectedRoute from "../contexts/ProtectedRoute";

import LoginPage from "../pages/login/Login";
import DashboardPage from "../pages/Dashboard";
import ProductListPage from "../pages/products/List";
import ClientListPage from "../pages/clients/ClientListPage";
import ClientDetailPage from "../pages/clients/ClientDetailPage";
import ClientCreatePage from "../pages/clients/ClientCreatePage";
import ClientUpdatePage from "../pages/clients/ClientUpdatePage";
import DrawNumberListPage from "../pages/drawNumber/DrawNumberListPage";
import DrawNumberDetailPage from "../pages/drawNumber/DrawNumberDetailPage";
import DrawNumberCreatePage from "../pages/drawNumber/DrawNumberCreatePage";
import DrawNumberUpdatePage from "../pages/drawNumber/DrawNumberUpdatePage";

const router = createBrowserRouter([
  {
    // 2. Use o App como o elemento raiz de tudo
    element: <App />,
    children: [
      // Rotas Protegidas (agora filhas do App)
      {
        element: (
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },

          /* Clients */
          {
            path: "/clients",
            element: <ClientListPage />,
          },
          {
            path: "/clients/:id",
            element: <ClientDetailPage />,
          },
          {
            path: "/clients/new",
            element: <ClientCreatePage />,
          },
          {
            path: "/clients/:id/edit",
            element: <ClientUpdatePage />,
          },

          /* Draw Numbers */
          {
            path: "/draw-numbers",
            element: <DrawNumberListPage />,
          },
          {
            path: "/draw-numbers/:id",
            element: <DrawNumberDetailPage />,
          },
          /*{
            path: "/draw-numbers/new",
            element: <DrawNumberCreatePage />,
          },
          {
            path: "/draw-numbers/:id/edit",
            element: <DrawNumberUpdatePage />,
          },*/

          /* Products */
          {
            path: "/products",
            element: <ProductListPage />,
          },
        ],
      },
      // Rotas Públicas (agora filhas do App)
      {
        element: <GuestLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
