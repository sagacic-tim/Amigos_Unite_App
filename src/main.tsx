// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from '@/routes/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/App.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </React.StrictMode>
);
