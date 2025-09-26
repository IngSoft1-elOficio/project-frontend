//import { useAppContext, useAppDispatch } from '../../context/AppContext'
import { useUser } from '../../context/UserContext.jsx'
import { useNavigate } from 'react-router-dom'
import BackgroundList from '../../components/BackgroundList'
import Button from '../../components/Button'
import ItemList from '../../components/ItemList'
import ProfileCard from '../../components/ProfileCard'

function GamesScreen() {
  const navigate = useNavigate()
  const elementsPosition =
    //'flex flex-row justify-center items-end h-screen pb-12'
    'flex flex-col justify-center items-end h-screen'

  //Spacing between buttons
  const buttonSeparation = 'flex flex-col pt-12 gap-5 pe-8'
  //'flex flex-row pt-12 gap-10'

  //  const handleRefresh = () => {
  //    lobbyDispatch({ type: lobbyActionTypes.LOGOUT })
  //    navigate('/ingreso')
  //  }

  const { userState } = useUser()
  const player = {
    name: userState.name,
    avatar: userState.avatarPath,
    birthdate: userState.birthdate,
    isHost: userState.isHost,
  }
  return (
    <div>
      <BackgroundList>
        <div className="pt-4 ps-4">
          <ItemList />
        </div>
        <div className={`${elementsPosition}`}>
          <div className="pe-8">
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
            <Button>Actualizar</Button>
            <Button onClick={() => navigate('/lobby')}>Volver</Button>
          </div>
        </div>
      </BackgroundList>
    </div>
  )
}

export default GamesScreen
