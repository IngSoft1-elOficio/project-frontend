import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import App from './App.jsx'
import GameJoin from './containers/GameJoin.jsx'
import PantallaDeCreacion from "./containers/PantallaDeCreacion.jsx";
import LobbyScreen from './containers/LobbyScreen.jsx'
import { UserProvider } from './context/UserContext.jsx';
import { GameProvider } from './context/GameContext.jsx';
import ConnectionBeacon from './components/ConnectionBeacon.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="lobby" element={<LobbyScreen />} />
            <Route path="newgame" element={<PantallaDeCreacion />} />
            <Route path = "/game_join/:gameId" element = {<GameJoin/>}></Route>
          </Routes>
          <ConnectionBeacon />
        </BrowserRouter>
      </GameProvider>
    </UserProvider>
  </StrictMode>
);