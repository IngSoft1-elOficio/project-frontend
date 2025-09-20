import ProfileCard from './ProfileCard';
import Button from './Button';

function LobbyScreen() {
return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo.jpeg')" }}
    >
      <div className="relative z-10 flex items-center pt-40 justify-end h-screen pr-36">
      <div className="rounded-xl shadow-lg p-6 flex items-center gap-6">

      <div className="flex flex-col gap-4 space-y-6">
            <Button color="green">Crear partida</Button>
            <Button color="blue">Unirse a partida</Button>
            <Button color="red">Salir</Button>
      </div>
    
    </div>
    </div>
    </div>
  )
}

export default LobbyScreen;