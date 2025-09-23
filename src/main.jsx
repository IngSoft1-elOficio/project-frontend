import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.jsx'
import PantallaDeCreacion from "./containers/PantallaDeCreacion.jsx";
import './index.css';
import './styles.css';
import { AppProvider } from './context/AppContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="newgame" element={<PantallaDeCreacion />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
)
