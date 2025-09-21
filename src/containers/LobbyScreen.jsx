import ProfileCard from '../components/ProfileCard'
import Button from '../components/Button'
import Background from '../components/Background'

function LobbyScreen() {
  const player = {
    name: 'Jugador',
    avatar: '/images/icon_2.png',
    birthdate: '21/09/1995',
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
            <Button>Crear partida</Button>
            <Button>Unirse a partida</Button>
            <Button>Salir</Button>
          </div>
        </div>
      </Background>
    </div>
  )
}

export default LobbyScreen
