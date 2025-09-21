import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";
import Continuar from "../components/Continuar";

export default function PantallaDeCreacion() {
  const [nombre, setNombre] = useState("");
  const [jugadores, setJugadores] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const jugadorId = localStorage.getItem('jugadorId') || uuidv4();
  localStorage.setItem('jugadorId', jugadorId);

  const handleContinue = async () => {
    try{
      const response = await fetch("http://localhost:4000/api/newgame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, jugadores, host: jugadorId }),
      });

      if (response.status === 409) {
        setError("Ya existe una partida con ese nombre.");
        return;
      }

      if (!response.ok) throw new Error();

      const data = await response.json();
      navigate(`/lobby/${data.id_partida}`);
    }
    catch(error){
      setError("Error al crear la partida.");
    }
  };

  return (
    <div className="
    fixed inset-0
    bg-black bg-[url('./assets/background_crear_partida.jpeg')]
    bg-no-repeat bg-cover bg-center
    flex items-center justify-end
    "
    >
      <div className="
      p-8 rounded-2xl w-[480px]
      flex flex-col gap-8 items-start
      "
      >
        {error && <p className="text-[#ff3333] mt-4 font-bold text-base">{error}</p>}
        <NombreDePartida nombre={nombre} setNombre={setNombre} />
        <CantidadDeJugadores jugadores={jugadores} setJugadores={setJugadores} />
        <Continuar
          nombre={nombre}
          jugadores={jugadores}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
