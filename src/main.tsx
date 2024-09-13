import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Use BrowserRouter instead of Router
import ErrorBoundary from './components/ErrorBoundary'; // Import the ErrorBoundary component
import App from './App';
import './App.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter> {/* Use BrowserRouter */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);