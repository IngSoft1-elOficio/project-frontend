import { useNavigate } from 'react-router-dom'
import { useAppContext, useAppDispatch } from '../context/AppContext'
import { actionTypes } from '../context/appState'
import ProfileCard from '../components/ProfileCard'
import Button from '../components/Button'
import Background from '../components/Background'

function LobbyScreen() {
  const navigate = useNavigate()
  const { player } = useAppContext()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch({ type: actionTypes.LOGOUT })
  }

  console.log('[LobbyScreen] Estado player:', player)

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
