import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";
import LobbyError from "../components/LobbyError.jsx";
import { useEffect } from "react";

export default function GameJoin() {
  const navigate = useNavigate();

  // Contexts
  const { gameState, gameDispatch } = useGame();
  const { userState } = useUser();

    useEffect(() => {
      console.log("Game state at waiting: ", gameState);
      console.log("User state at waiting: ", userState);

      // Navigate only if user is not the host and roomId is set
      if (!userState.isHost && gameState.roomId && gameState.status == 'INGAME') {
        navigate(`/game/${gameState.roomId}`);
      }
  }, [gameState, userState])

  const { gameId, jugadores, roomInfo } = gameState;

  const handleStart = async () => {
    if (!userState.isHost) return;

    console.log('🚀 Starting game, socket connected?', gameState.connected);
    console.log('🎮 Current gameId:', gameState.gameId);
    
    try {
      const payload = { user_id: userState.id }; 
      console.log("Sending payload:", payload);
      
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || "Error al iniciar partida");
      }
      
      const data = await response.json();
      console.log("Partida iniciada: la respuesta del post es:", data);

    gameDispatch({
      type: 'UPDATE_GAME_STATE_PUBLIC',
      payload: {
      turno_actual: data.turn?.current_player_id || gameState.turnoActual,
      status: data.game?.status || 'INGAME',
      jugadores: data.players || gameState.jugadores,
      timestamp: new Date().toISOString()
    }});

      navigate(`/game/${gameState.roomId}`)

    } catch (error) {
      console.error("Fallo en handleStart:", error);
    }
  };  

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      
      <div
        className="fixed inset-0 bg-[url('/background.png')] bg-cover bg-center"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F] font-limelight">
          Partida:{" "}
          <span className="font-black">{roomInfo?.name || gameId || "Sin nombre"}</span>
        </h1>

        <Card title="Jugadores" className="mb-8 font-limelight">
          <PlayersList players={jugadores} />
        </Card>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          {userState?.isHost && (<Button
            onClick={handleStart}
            className="font-limelight"
          >
            Iniciar partida
          </Button>)}
        </div>
      </div>
    </main>
  );
}
