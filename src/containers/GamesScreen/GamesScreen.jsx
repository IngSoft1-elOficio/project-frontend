//import { useAppContext, useAppDispatch } from '../../context/AppContext'
import { use, useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { useNavigate } from 'react-router-dom'
import './GamesScreen.css'
import BackgroundList from '../../components/BackgroundList'
import Button from '../../components/Button'
import ItemList from '../../components/ItemList'
import ProfileCard from '../../components/ProfileCard'
import LobbyError from '../../components/LobbyError'
import { useGame } from '../../context/GameContext.jsx'

function GamesScreen() {
  const navigate = useNavigate()
  const { userState } = useUser()
  const { gameState } = useGame()
 
  useEffect(() => {
      console.log("Game state at join games: ", gameState);
      console.log("User state at join games: ", userState);
  }, [gameState, userState])

  const [partidas, setPartidas] = useState([])
  //Position of Buttons and ProfileCard
  const elementsPosition = 'flex flex-col justify-center items-end h-screen'

  //Spacing between buttons
  const buttonSeparation = 'flex flex-col pt-12 gap-5 pe-8'

  //Separation itemList
  const itemListSeparation = 'pt-4 ps-4'

  //ProfileCard separation
  const profileCardSeparation = 'pe-8'

  //Fetch games from backend
  const fetchPartidas = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/game_list')
      if (!res.ok) throw new Error('Error al cargar partidas')
      const data = await res.json()
      setPartidas(data.items)
      /*const mockData = {
        items: [
          { id: 1, name: 'Sala 1', playersJoined: 2, playerQty: 6 },
        ],
      }
      setPartidas(mockData.items) */
    } catch (err) {
      console.error('Error obteniendo partidas', err)
    }
  }

  useEffect(() => {
    fetchPartidas()
  }, [])

  //Condition to be logged - check if user has required data
  const isLoggedIn =
    userState.name !== '' &&
    userState.avatarPath !== '' &&
    userState.birthdate !== ''

  const player = {
    name: userState.name,
    avatar: userState.avatarPath,
    birthdate: userState.birthdate,
    isHost: userState.isHost,
  }

  console.log(partidas)

  return (
    <div>
      <BackgroundList>
        {isLoggedIn ? (
          <>
            {/* ItemList */}
            <div className={`${itemListSeparation}`}>
              <ItemList partidas={partidas} />
            </div>

            {/* Buttons and ProfileCard */}
            <div className={`${elementsPosition}`}>
              <div className={`${profileCardSeparation}`}>
                {/* Card with player data */}
                <ProfileCard
                  name={player.name}
                  host={player.host}
                  avatar={player.avatar}
                  birthdate={player.birthdate}
                />
              </div>
              {/* Buttons section */}
              <div className={`${buttonSeparation}`}>
                <Button onClick={fetchPartidas}>Actualizar</Button>
                <Button onClick={() => navigate('/lobby')}>Volver</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="justify-center">
            <LobbyError navigate={navigate} />
          </div>
        )}
      </BackgroundList>
    </div>
  )
}

export default GamesScreen
