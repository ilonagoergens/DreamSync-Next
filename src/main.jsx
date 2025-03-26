import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Clear any stale tokens on app start
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

if (token && !userId) {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userProfile');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);