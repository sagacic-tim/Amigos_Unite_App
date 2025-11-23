// src/routes/routes.tsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from '@/layout/app-layout';
import RequireAuth from './RequireAuth';

const Home   = lazy(() => import('@pages/Home'));
const Amigos = lazy(() => import('@pages/Amigos'));
const Events = lazy(() => import('@pages/Events'));
const About  = lazy(() => import('@pages/About'));
const Contact= lazy(() => import('@pages/Contact'));
const Profile= lazy(() => import('@pages/Profile'));
const NotFound = lazy(() => import('@pages/NotFound'));
const EventAmigoConnectors = lazy(() => import('@pages/EventAmigoConnectors'));
const ConfirmAccount = lazy(() => import('@pages/Authentication/ConfirmAccount'));
const ResendConfirmation = lazy(() => import('@pages/Authentication/ResendConfirmation'));

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

      // public routes
      { path: 'confirm', element: withSuspense(<ConfirmAccount />) },
      { path: 'confirm/resend', element: withSuspense(<ResendConfirmation />) },
      { path: 'about', element: withSuspense(<About />) },
      { path: 'contact', element: withSuspense(<Contact />) },
      { path: 'events', element: withSuspense(<Events />) },

      // protected routes
      {
        element: <RequireAuth />,
        children: [
          { path: 'amigos',  element: withSuspense(<Amigos />) },
          { path: 'user-profile', element: withSuspense(<Profile />) },
        ],
      },

      // keep this last
      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
