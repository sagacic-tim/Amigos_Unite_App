// src/routes/routes.tsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import RequireAuth from './RequireAuth';

const Home           = lazy(() => import('@pages/Home'));
const Amigos         = lazy(() => import('@pages/Amigos'));
const Events         = lazy(() => import('@pages/Events'));

const About          = lazy(() => import('@pages/About'));
const Contact        = lazy(() => import('@pages/Contact'));
const Authentication = lazy(() => import('@pages/Authentication'));
const Profile        = lazy(() => import('@pages/Profile'));
const NotFound       = lazy(() => import('@pages/NotFound'));
const EventAmigoConnectors = lazy(() => import('@/pages/EventAmigoConnectors'));

const withSuspense = (el: JSX.Element) => <Suspense fallback={<div>Loading…</div>}>{el}</Suspense>;
const RouteError: React.FC = () => <div className="container content-section">Something went wrong.</div>;

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/',               element: withSuspense(<Home />) },
      { path: '/about',          element: withSuspense(<About />) },
      { path: '/contact',        element: withSuspense(<Contact />) },
      { path: '/authentication', element: withSuspense(<Authentication />) },

      { path: '/events',         element: withSuspense(<Events />) }, // list page

      { path: '/amigos',         element: <RequireAuth>{withSuspense(<Amigos />)}</RequireAuth> },
      { path: '/profile',        element: <RequireAuth>{withSuspense(<Profile />)}</RequireAuth> },
      { path: '/event-amigo-connectors', element: withSuspense(<EventAmigoConnectors />) },

      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
