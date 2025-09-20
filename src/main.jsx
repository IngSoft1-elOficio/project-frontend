import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import LoginScreen from './containers/LoginScreen/LoginScreen.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="ingreso" element={<LoginScreen />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);
