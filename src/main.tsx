// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./root";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
