import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePartidaContext, usePartidaDispatch, actionTypes } from "../context/PartidaContext";
// import { userContext } from "../context/userContext";
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";
import Continuar from "../components/Continuar";

export default function PantallaDeCreacion() {
  const { nombre_partida, jugadores } = usePartidaContext();
 // const { nombre, avatar, fechaNacimiento } = userContext();
  const dispatch = usePartidaDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
 
  const handleContinue = async () => {
    try{
      const response = await fetch("http://localhost:8000/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_partida, jugadores, host_id: true /*nombre, avatar, fechaNacimiento,*/ }),
      });

      if (response.status === 409) {
        setError("Ya existe una partida con ese nombre");
        return;
      }

      if (!response.ok) throw new Error();

      const data = await response.json();
      navigate(`/game_join/${data.id_partida}`);
    }
    catch(error){
      setError("Error al crear la partida");
    }
  };

  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        <NombreDePartida nombre_partida={nombre_partida} setNombrePartida={(value) =>
            dispatch({ type: actionTypes.SET_NOMBRE_PARTIDA, payload: value })} 
            setError={setError}
        />
        <CantidadDeJugadores jugadores={jugadores} setJugadores={(value) =>
            dispatch({ type: actionTypes.SET_JUGADORES, payload: value })}
        />
        <Continuar
          nombre={nombre_partida}
          jugadores={jugadores}
          onContinue={handleContinue}
          setError={setError}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
