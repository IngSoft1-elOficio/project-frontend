import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ProfileCard from '../components/ProfileCard'
import Button from '../components/Button'
import Background from '../components/Background'

function LobbyScreen() {
  const navigate = useNavigate()

  const [player, setPlayer] = useState({
    name: 'Jugador',
    avatar: '/images/avatar_4.png',
    birthdate: '21/09/1995',
  })

  const handleLogout = () => {
    setPlayer({ name: '', avatar: '', birthdate: '' })
    navigate('/ingreso')
  }

  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48'

  const buttonSeparation = 'flex flex-col pt-12 gap-5'

  return (
    <div>
      <Background>
        <div className={`${elementsPosition}`}>
          <ProfileCard
            name={player.name}
            avatar={player.avatar}
            birthdate={player.birthdate}
          />
          <div className={`${buttonSeparation}`}>
            <Button onClick={() => navigate('/newgame')}>Crear partida</Button>
            <Button onClick={() => navigate('/games')}>Unirse a partida</Button>
            <Button onClick={handleLogout}>Salir</Button>
          </div>
        </div>
      </Background>
    </div>
  )
}

export default LobbyScreen
