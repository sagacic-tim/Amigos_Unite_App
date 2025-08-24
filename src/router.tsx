
// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/Layout";
import HomePage from "@/pages/HomePage";
import AmigosPage from "@/pages/AmigosPage";
// ...other pages

export const router = createBrowserRouter([
  {
    element: <Layout />,   // <-- header lives here, used by all children
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/amigos", element: <AmigosPage /> },
      // ...more routes
    ],
  },
]);
