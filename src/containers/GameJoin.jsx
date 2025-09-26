import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";

export default function GameJoin() {
  const navigate = useNavigate();

  // Contexts
  const { gameState } = useGame();
  const { userState } = useUser();

  const { gameId, jugadores } = gameState;
  const { isHost } = userState;

  // Host player
  const hostUser = jugadores.find((u) => u.isHost === true);
  const hostId = hostUser?.user_id;

  const handleStart = async () => {
    if (!isHost) return;

    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameId}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: hostId }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al iniciar partida");
      }

      // Opcional: podrías navegar a la pantalla de juego
      // navigate(`/game/${gameId}`);
    } catch (error) {
      console.error("Fallo en handleStart:", error);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <div
        className="fixed inset-0 z-0 bg-[url('/background.png')] bg-cover bg-center"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F] font-limelight">
          Partida:{" "}
          <span className="font-black">{gameId || "Sin nombre"}</span>
        </h1>

        <Card title="Jugadores" className="mb-8 font-limelight">
          <PlayersList players={jugadores} hostId={hostId} />
        </Card>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Button
            onClick={handleStart}
            disabled={!isHost}
            className="font-limelight"
          >
            Iniciar partida
          </Button>
        </div>
      </div>
    </main>
  );
}
