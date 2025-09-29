import "../styles.css"
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { useGame } from "../context/GameContext.jsx";
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";
import Continuar from "../components/Continuar";
import ProfileCard from "../components/ProfileCard.jsx";
import LobbyError from "../components/LobbyError.jsx";

export default function PantallaDeCreacion() {
  const navigate = useNavigate();
  const { userState, userDispatch } = useUser();
  const { gameState, gameDispatch, connectToGame  } = useGame();
  
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
          room: {
              nombre_partida: gameForm.nombre_partida,
              jugadores: gameForm.jugadores
          },
          player: {
              nombre: userState.name,
              avatar: userState.avatarPath,
              fechaNacimiento: userState.birthdate
          }
      };

      console.log(requestData);

      const response = await fetch("http://localhost:8000/game", {
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
      console.log("Response data:", data);
    
      // Update user context with the host player data
      const hostPlayer = data.players.find(player => player.is_host) || data.players[0];
      userDispatch({ 
        type: 'SET_USER', 
        payload: {
          id: hostPlayer.id,
          name: hostPlayer.name,
          avatarPath: hostPlayer.avatar, // Map avatar to avatarPath
          birthdate: hostPlayer.birthdate,
          isHost: hostPlayer.is_host
        }
      });
      
      // Initialize game with room and players data
      gameDispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: {
          room: {
            id: data.room.id,
            name: data.room.name,
            playerQty: data.room.player_qty,
            status: data.room.status,
            hostId: data.room.host_id
          },
          players: data.players
        }
      });
      
      // Conectar con el websocket
      console.log('Connecting with gameId:', data.room.id, 'userId:', hostPlayer.id);
      connectToGame(data.room.id, hostPlayer.id);
      
      navigate(`/game_join/${data.id_partida}`);

    } catch (error) {
      setError("Error al crear la partida: ", error);
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
      { // userState.name ? 
      <div className="form-container">
        <ProfileCard
                name={userState.name}
                host={userState.isHost}
                avatar={userState.avatarPath}
                birthdate={userState.birthdate}
              />

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
      </div> // : <LobbyError navigate={navigate}/> 
      }
    </div>
  );
}