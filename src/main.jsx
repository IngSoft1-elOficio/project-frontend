import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppLobbyScreen from './containers/LobbyScreen.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="lobby" element={<AppLobbyScreen />} />
          <Route
            path="newgame"
            element={<div>Nueva partida (placeholder)</div>}
          />
          <Route
            path="games"
            element={<div>Lista de partidas (placeholder)</div>}
          />
          <Route path="ingreso" element={<div>Ingreso (placeholder)</div>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
)
