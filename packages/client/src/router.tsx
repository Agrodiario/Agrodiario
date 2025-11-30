import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RootRedirector } from './components/RootRedirector';

// Páginas
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import HomePage from './pages/Home';
import DiaryPage from './pages/Diary';
import PropertiesPage from './pages/Properties';
import CulturesPage from './pages/Cultures';
import ProductsPage from './pages/Products';
import DiaryLayout from './layouts/DiaryLayout';
import NewActivity from './pages/NewActivity';
import EditActivity from './pages/EditActivity';
import PropertiesLayout from './layouts/PropertiesLayout';
import NewProperty from './pages/NewProperty';
import EditProperty from './pages/EditProperty';
import CulturesLayout from './layouts/CulturesLayout';
import Landing from './pages/landing-page/Landing';

export const router = createBrowserRouter([
  /* --- ROTA RAIZ - Redirecionamento Inteligente --- */
  {
    path: '/',
    element: <RootRedirector />,
  },

  /* --- LANDING PAGE (Pública) --- */
  {
    path: '/landing',
    element: <Landing />,
  },

  /* --- AUTENTICAÇÃO (Públicas) --- */
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  /* --- APP PRINCIPAL (Protegido) --- */
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'home',
        element: <HomePage />,
      },

      {
        path: 'diary',
        element: <DiaryLayout />,
        children: [
          { index: true, element: <DiaryPage /> }, 
          { path: 'new', element: <NewActivity /> },
          { path: 'edit/:id', element: <EditActivity /> }
        ],
      },

      {
        path: 'properties',
        element: <PropertiesLayout />,
        children: [
          { index: true, element: <PropertiesPage /> },
          { path: 'new', element: <NewProperty /> },
          { path: 'edit/:id', element: <EditProperty /> }
        ],
      },

      /* Culturas */
      {
        path: 'cultures',
        element: <CulturesLayout />,
        children: [
          { index: true, element: <CulturesPage /> },
        ],
      },

      { path: 'products', element: <ProductsPage /> },
      
      {
        path: '*',
        element: <Navigate to="/home" replace />,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/landing" replace />,
  },
]);