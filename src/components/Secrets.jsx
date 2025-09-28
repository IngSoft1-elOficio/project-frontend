import { useState } from "react";
import { useGame } from "../context/GameContext";
import front from "../assets/secret_front.png";
import back from "../assets/secret_back.png";
import murderer from "../assets/secret_murderer.png";
import accomplice from "../assets/secret_accomplice.png";

export default function Secrets() {
  const { gameState } = useGame();
  const secretos = gameState.secretos || [];
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const getSecretImage = (secret, isHovered) => {
    if (!isHovered) return front;
    if (secret.name === "You're the murderer") return murderer;
    if (secret.name === "You're the accomplice") return accomplice;
    return back;
  };

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", width: "100%", minHeight: 640 }}>
      {secretos.map((secret, index) => (
        <button 
          key={secret.id}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ border: "none" }}
        >
          <img 
            src={getSecretImage(secret, hoveredIndex === index)} 
            alt={`secret-${secret.id}`}
            style={{ width: 80, height: 110, objectFit: "cover" }}  
          />
        </button>
      ))}
    </div>
  );
}

