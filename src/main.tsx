import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/global.css';
import './css/components.css';
import './css/slides.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
