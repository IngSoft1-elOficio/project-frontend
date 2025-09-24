import { useNavigate } from 'react-router-dom'
import { useAppContext, useAppDispatch } from '../context/AppContext'
import { lobbyActionTypes } from '../context/userStateLobby'
import LobbyContent from '../components/LobbyContent'
import LobbyError from '../components/LobbyError'
import Background from '../components/Background'

function LobbyScreen() {
  const navigate = useNavigate() //Works like buttons with links
  const { lobbyState } = useAppContext()
  const { player } = lobbyState
  const { lobbyDispatch } = useAppDispatch()

  //Logout: delete player data from global context
  const handleLogout = () => {
    lobbyDispatch({ type: lobbyActionTypes.LOGOUT })
    navigate('/ingreso')
  }

  //Condition to be logged
  const isLoggedIn =
    player.name !== '' && player.avatar !== '' && player.birthdate !== ''

  //Print player status from [LobbyScreen] in console (userStateLobby should be equal)
  //console.log('[LobbyScreen] Estado player:', player)

  //If player loged shows buttons with player data
  //if not then shows an error message with a button to "login"
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
