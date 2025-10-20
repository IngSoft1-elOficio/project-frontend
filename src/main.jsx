import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import GameJoin from './containers/GameJoin.jsx'
import PantallaDeCreacion from './containers/PantallaDeCreacion.jsx'
import LobbyScreen from './containers/LobbyScreen.jsx'
import GameScreen from './containers/gameScreen/GameScreen.jsx'
import GamesScreen from './containers/GamesScreen/GamesScreen.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { GameProvider } from './context/GameContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <GameProvider autoReconnect={true}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="lobby" element={<LobbyScreen />} />
            <Route path="newgame" element={<PantallaDeCreacion />} />
            <Route path = "/game_join/:gameId" element = {<GameJoin/>} />
            <Route path = "/game/:gameId" element={<GameScreen />} />
            <Route path="games" element={<GamesScreen />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </UserProvider>
  </StrictMode>
)
