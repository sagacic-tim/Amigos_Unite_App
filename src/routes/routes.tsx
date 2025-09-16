// src/routes/routes.tsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import RequireAuth from './RequireAuth';

const Home   = lazy(() => import('@pages/Home'));
const Amigos = lazy(() => import('@pages/Amigos'));
const Events = lazy(() => import('@pages/Events'));
const About  = lazy(() => import('@pages/About'));
const Contact= lazy(() => import('@pages/Contact'));
const Profile= lazy(() => import('@pages/Profile'));
const NotFound = lazy(() => import('@pages/NotFound'));
const EventAmigoConnectors = lazy(() => import('@pages/EventAmigoConnectors'));

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<div>Loading…</div>}>{el}</Suspense>
);

const RouteError: React.FC = () => (
  <div className="container content-section">Something went wrong.</div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'about', element: withSuspense(<About />) },
      { path: 'contact', element: withSuspense(<Contact />) },
      { path: 'events', element: withSuspense(<Events />) },
      { path: 'event-amigo-connectors', element: withSuspense(<EventAmigoConnectors />) },

      // Protected routes
      {
        element: <RequireAuth />, // Outlet-based guard
        children: [
          { path: 'amigos',  element: withSuspense(<Amigos />) },
          { path: 'profile', element: withSuspense(<Profile />) },
        ],
      },

      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
