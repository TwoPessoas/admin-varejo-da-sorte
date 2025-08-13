import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App"; // 1. Importe o novo componente App
import DefaultLayout from "../layouts/DefaultLayout";
import GuestLayout from "../layouts/GuestLayout";
import ProtectedRoute from "../contexts/ProtectedRoute";

import LoginPage from "../pages/login/Login";
import DashboardPage from "../pages/Dashboard";
import ClientListPage from "../pages/clients/ClientListPage";
import ClientDetailPage from "../pages/clients/ClientDetailPage";
import ClientCreatePage from "../pages/clients/ClientCreatePage";
import ClientUpdatePage from "../pages/clients/ClientUpdatePage";
import DrawNumberListPage from "../pages/drawNumber/DrawNumberListPage";
import DrawNumberDetailPage from "../pages/drawNumber/DrawNumberDetailPage";
import GameOpportunityListPage from "../pages/gameOpportunity/GameOpportunityListPage";
import GameOpportunityDetailPage from "../pages/gameOpportunity/GameOpportunityDetailPage";
import InvoiceListPage from "../pages/invoices/InvoiceListPage";
import InvoiceDetailPage from "../pages/invoices/InvoiceDetailPage";
import InvoiceCreatePage from "../pages/invoices/InvoiceCreatePage";
import VoucherListPage from "../pages/vouchers/VoucherListPage";
import VoucherDetailPage from "../pages/vouchers/VoucherDetailPage";
import VoucherCreatePage from "../pages/vouchers/VoucherCreatePage";
import VoucherUpdatePage from "../pages/vouchers/VoucherUpdatePage";
import PageContentListPage from "../pages/pagesContent/PageContentListPage";
import PageContentDetailPage from "../pages/pagesContent/PageContentDetailPage";
import PageContentCreatePage from "../pages/pagesContent/PageContentCreatePage";
import PageContentUpdatePage from "../pages/pagesContent/PageContentUpdatePage";
import ProductListPage from "../pages/products/ProductListPage";

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

          /* Opportunities */
          {
            path: "/opportunities",
            element: <GameOpportunityListPage />,
          },
          {
            path: "/opportunities/:id",
            element: <GameOpportunityDetailPage />,
          },

          /* Invoice */
          {
            path: "/invoices",
            element: <InvoiceListPage />,
          },
          {
            path: "/invoices/:id",
            element: <InvoiceDetailPage />,
          },
          {
            path: "/invoices/new",
            element: <InvoiceCreatePage />,
          },

          /* Vouchers */
          {
            path: "/vouchers",
            element: <VoucherListPage />,
          },
          {
            path: "/vouchers/:id",
            element: <VoucherDetailPage />,
          },
          {
            path: "/vouchers/new",
            element: <VoucherCreatePage />,
          },
          {
            path: "/vouchers/:id/edit",
            element: <VoucherUpdatePage />,
          },

          /* Vouchers */
          {
            path: "/pages-content",
            element: <PageContentListPage />,
          },
          {
            path: "/pages-content/:id",
            element: <PageContentDetailPage />,
          },
          {
            path: "/pages-content/new",
            element: <PageContentCreatePage />,
          },
          {
            path: "/pages-content/:id/edit",
            element: <PageContentUpdatePage />,
          },

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
