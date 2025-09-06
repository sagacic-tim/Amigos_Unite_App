import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/Layout";

// Pages
import HomePage from "@/pages/HomePage";
import AmigosPage from "@/pages/AmigosPage";

const RouteError: React.FC = () => (
  <div className="container content-section">Something went wrong.</div>
);

export const router = createBrowserRouter([
  {
    element: <Layout />,            // Header + breadcrumbs + footer + <Outlet />
    errorElement: <RouteError />,   // optional
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/amigos", element: <AmigosPage /> },
      { path: "*", element: <HomePage /> }, // keep your current fallback
    ],
  },
]);
