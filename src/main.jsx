import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GameJoin from './containers/GameJoin.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {AppProvider} from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
       <Routes>
          <Route path ="/" element ={<App />}></Route>
          <Route path = "/game_join/123" element = {<GameJoin/>}></Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
)
