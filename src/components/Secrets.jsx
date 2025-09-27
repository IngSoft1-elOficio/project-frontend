import { useGame } from "../context/GameContext";
import front from "../assets/secret_front.png";

export default function Secrets() {
  const { gameState } = useGame();
  const secretos = gameState.secretos || [];

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", width: "100%", minHeight: 640 }}>
      {secretos.map((secret) => (
        <button key={secret.id}>
          <img 
            src={front} 
            alt={`secret-front-${secret.id}`}
            style={{ width: 80, height: 110, objectFit: "cover" }}  
          />
        </button>
      ))}
    </div>
  );
}

