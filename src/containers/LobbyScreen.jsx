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

  const isLoggedIn =
    player.name !== '' && player.avatar !== '' && player.birthdate !== ''

  console.log('[LobbyScreen] Estado player:', player)

  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48'

  const buttonSeparation = 'flex flex-col pt-12 gap-5'

  const errorStyle =
    'font-[Limelight] text-4xl w-64 text-center text-red-600 pb-4'
  const errorMsgStyle =
    'font-[Limelight] text-4xl w-64 text-center text-white pb-8'

  return (
    <div>
      <Background>
        {isLoggedIn ? (
          <div className={`${elementsPosition}`}>
            <ProfileCard
              name={player.name}
              avatar={player.avatar}
              birthdate={player.birthdate}
            />
            <div className={`${buttonSeparation}`}>
              <Button onClick={() => navigate('/newgame')}>
                Crear partida
              </Button>
              <Button onClick={() => navigate('/games')}>
                Unirse a partida
              </Button>
              <Button onClick={handleLogout}>Salir</Button>
            </div>
          </div>
        ) : (
          <div className={`${elementsPosition}`}>
            <p className={`${errorStyle}`}>¡ERROR!</p>
            <p className={`${errorMsgStyle}`}>
              Debes iniciar sesion para acceder al lobby
            </p>
            <Button onClick={() => navigate('/ingreso')}>Ingreso</Button>
          </div>
        )}
      </Background>
    </div>
  )
}

export default LobbyScreen
