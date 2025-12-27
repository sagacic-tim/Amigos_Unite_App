// src/routes/routes.tsx
import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "@/layout/app-layout";
import RequireAuth from "./RequireAuth";

// Lazy-loaded pages
const Home = lazy(() => import("@pages/Home"));
const Amigos = lazy(() => import("@pages/Amigos"));
const Events = lazy(() => import("@pages/Events"));
const About = lazy(() => import("@pages/About"));
const Contact = lazy(() => import("@pages/Contact"));
const Profile = lazy(() => import("@pages/Profile"));
const NotFound = lazy(() => import("@pages/NotFound"));
// NOTE: EventAmigoConnectors lazy import removed because it was unused
const ConfirmAccount = lazy(
  () => import("@pages/Authentication/ConfirmAccount")
);
const ResendConfirmation = lazy(
  () => import("@pages/Authentication/ResendConfirmation")
);

// Events CRUD pages
const CreateEvent = lazy(
  () => import("@pages/Events/CreateEventPage")
);
const ManageEvents = lazy(
  () => import("@pages/Events/ManageEventsPage")
);
const EditEvent = lazy(
  () => import("@pages/Events/EditEventPage")
);

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<div>Loading…</div>}>{el}</Suspense>
);

const RouteError: React.FC = () => (
  <div className="container content-section">Something went wrong.</div>
);

// Keep router internal to this module so the file only exports components
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<Home />) },

      // Public routes
      { path: "confirm", element: withSuspense(<ConfirmAccount />) },
      {
        path: "confirm/resend",
        element: withSuspense(<ResendConfirmation />),
      },
      { path: "about", element: withSuspense(<About />) },
      { path: "contact", element: withSuspense(<Contact />) },
      { path: "events", element: withSuspense(<Events />) },

      // Protected routes
      {
        element: <RequireAuth />,
        children: [
          { path: "amigos", element: withSuspense(<Amigos />) },
          { path: "user-profile", element: withSuspense(<Profile />) },

          // Events CRUD routes
          {
            path: "events/new",
            element: withSuspense(<CreateEvent />),
          },
          {
            path: "events/manage",
            element: withSuspense(<ManageEvents />),
          },
          {
            path: "events/:eventId/edit",
            element: withSuspense(<EditEvent />),
          },
        ],
      },

      // Keep this last
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
