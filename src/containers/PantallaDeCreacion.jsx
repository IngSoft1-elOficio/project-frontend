import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";
import Continuar from "../components/Continuar";

export default function PantallaDeCreacion() {
  const [nombre, setNombre] = useState("");
  const [jugadores, setJugadores] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleContinue = async () => {
    try{
      const response = await fetch("http://localhost:4000/api/newgame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, jugadores }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      navigate(`/lobby/${data.id_partida}`);
    }
    catch(error){
      setError("Error al crear la partida.");
    }
  };

  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
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
