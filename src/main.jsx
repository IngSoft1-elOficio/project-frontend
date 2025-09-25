import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx'
import GameJoin from './containers/GameJoin.jsx'
import PantallaDeCreacion from "./containers/PantallaDeCreacion.jsx";
import AppLobbyScreen from './containers/LobbyScreen.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="lobby" element={<AppLobbyScreen />} />
          <Route path="newgame" element={<PantallaDeCreacion />} />
          <Route path = "/game_join/:gameId" element = {<GameJoin/>}></Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);