import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/global.css';
import './css/slides.css';
import './css/components.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
