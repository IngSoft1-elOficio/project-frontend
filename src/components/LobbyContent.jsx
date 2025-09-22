import ProfileCard from '../components/ProfileCard'
import Button from '../components/Button'

export default function LobbyContent({ player, navigate, handleLogout }) {
  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48'

  const buttonSeparation = 'flex flex-col pt-12 gap-5'

  return (
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
  )
}
