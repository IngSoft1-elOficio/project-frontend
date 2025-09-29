import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";
import LobbyError from "../components/LobbyError.jsx";

export default function GameJoin() {
  const navigate = useNavigate();

  // Contexts
  const { gameState } = useGame();
  const { userState } = useUser();

  const { gameId, jugadores } = gameState;
  
  const handleStart = async () => {
    if (!userState.isHost) return;
    
    try {
      const payload = { user_id: userState.id }; // or whatever variable holds the current user's ID
      console.log("Sending payload:", payload); // Debug log
      
      const response = await fetch(
        `http://localhost:8000/game/${gameId}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      
      console.log("Response status:", response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Debug log
        throw new Error(errorData.detail || "Error al iniciar partida");
      }
      
      const data = await response.json();
      console.log("Partida iniciada:", data);

      navigate(`/game/${gameState.id}`)

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

      { // userState.name && gameState.gameId ? 
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F] font-limelight">
          Partida:{" "}
          <span className="font-black">{gameId || "Sin nombre"}</span>
        </h1>

        <Card title="Jugadores" className="mb-8 font-limelight">
          <PlayersList players={jugadores} />
        </Card>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Button
            onClick={handleStart}
            disabled={!userState.isHost}
            className="font-limelight"
          >
            Iniciar partida
          </Button>
        </div>
      </div> // : <LobbyError navigate={navigate} />  Descomentar para no mostrar si no esta logeado
      }

    </main>
  );
}
