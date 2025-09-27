//import { useAppContext, useAppDispatch } from '../../context/AppContext'
import { use, useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext.jsx'
import { useNavigate } from 'react-router-dom'
import './GamesScreen.css'
import BackgroundList from '../../components/BackgroundList'
import Button from '../../components/Button'
import ItemList from '../../components/ItemList'
import ProfileCard from '../../components/ProfileCard'

function GamesScreen() {
  const navigate = useNavigate()
  const { userState } = useUser()
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
  useEffect(() => {
    const fetchPartidas = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/game_list')
        if (!res.ok) throw new Error('Error al cargar partidas')
        const data = await res.json()
        setPartidas(data.items)
      } catch (err) {
        console.error('Error obteniendo partidas', err)
      }
    }
    fetchPartidas()
  }, [])

  //  const handleRefresh = () => {
  //    lobbyDispatch({ type: lobbyActionTypes.LOGOUT })
  //    navigate('/ingreso')
  //  }

  const player = {
    name: userState.name,
    avatar: userState.avatarPath,
    birthdate: userState.birthdate,
    isHost: userState.isHost,
  }

  return (
    <div>
      <BackgroundList>
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
            <Button onClick={() => window.location.reload()}>Actualizar</Button>
            <Button onClick={() => navigate('/lobby')}>Volver</Button>
          </div>
        </div>
      </BackgroundList>
    </div>
  )
}

export default GamesScreen
