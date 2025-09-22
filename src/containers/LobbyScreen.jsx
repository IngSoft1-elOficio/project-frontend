import { useNavigate } from 'react-router-dom'
import { useAppContext, useAppDispatch } from '../context/AppContext'
import { actionTypes } from '../context/appState'
import LobbyContent from '../components/LobbyContent'
import LobbyError from '../components/LobbyError'
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

  return (
    <div>
      <Background>
        {isLoggedIn ? (
          <LobbyContent
            player={player}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        ) : (
          <LobbyError navigate={navigate} />
        )}
      </Background>
    </div>
  )
}

export default LobbyScreen
