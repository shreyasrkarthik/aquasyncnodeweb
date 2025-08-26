import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Entry point for the AquaSync React application. The DOM
// element with id="root" is populated with the App component.

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);