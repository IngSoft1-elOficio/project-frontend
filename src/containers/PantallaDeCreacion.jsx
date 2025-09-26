import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { useGame } from "../context/GameContext.jsx";
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";
import Continuar from "../components/Continuar";

export default function PantallaDeCreacion() {
  const navigate = useNavigate();
  const { userState, userDispatch } = useUser();
  const { gameState, gameDispatch } = useGame();
  
  // Local state for game creation form
  const [gameForm, setGameForm] = useState({
    nombre_partida: "",
    jugadores: 2
  });
  const [error, setError] = useState("");

  const handleContinue = async () => {
    try {
      // Prepare the request data with user info
      const requestData = {
        nombre_partida: gameForm.nombre_partida,
        jugadores: gameForm.jugadores,
        host_id: true, // This user will be the host
        nombre: userState.name,
        avatar: userState.avatarPath,
        fechaNacimiento: userState.birthdate
      };

      const response = await fetch("http://localhost:8000/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.status === 409) {
        setError("Ya existe una partida con ese nombre");
        return;
      }

      if (!response.ok) throw new Error();

      const data = await response.json();
      
      // Set user as host since they created the game
      userDispatch({ type: 'SET_HOST', payload: true });
      
      // You might want to initialize some game state here if needed
      // gameDispatch({ type: 'SET_GAME_ID', payload: data.id_partida });

      navigate(`/game_join/${data.id_partida}`);
    } catch (error) {
      setError("Error al crear la partida");
    }
  };

  // Update form data handlers
  const setNombrePartida = (value) => {
    setGameForm(prev => ({
      ...prev,
      nombre_partida: value
    }));
    setError(""); // Clear error when user types
  };

  const setJugadores = (value) => {
    setGameForm(prev => ({
      ...prev,
      jugadores: value
    }));
  };

  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        <NombreDePartida 
          nombre_partida={gameForm.nombre_partida} 
          setNombrePartida={setNombrePartida}
          setError={setError}
        />
        
        <CantidadDeJugadores 
          jugadores={gameForm.jugadores} 
          setJugadores={setJugadores}
        />
        
        <Continuar
          nombre={gameForm.nombre_partida}
          jugadores={gameForm.jugadores}
          onContinue={handleContinue}
          setError={setError}
        />
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}