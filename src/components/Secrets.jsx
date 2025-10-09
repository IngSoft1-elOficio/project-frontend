import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function Secrets() {
  const { gameState } = useGame();
  const secretos = gameState.secretos || [];
  const [hoveredIndex, setHoveredIndex] = useState(null);

   const normalizeName = (name = '') =>
      name
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
  
    const IMAGE_MAP = {
      "secret murderer": murderer,
      "secret accomplice": accomplice
    };

  const getSecretImage = (secret, isHovered) => {
    if (!isHovered) return "/cards/secret_front.png";
    if (secret.name === "You're the murderer") return "/cards/secret_murderer.png";
    if (secret.name === "You're the accomplice") return "/cards/secret_accomplice.png";
    return "/cards/secret_back.png";
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: "16px", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      {secretos.map((secret, index) => (
        <button
          key={secret.id}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ 
            border: "none", 
            background: "transparent",
            cursor: "pointer",
            padding: 0
          }}
        >
          <img
            src={getSecretImage(secret, hoveredIndex === index)}
            alt={`secret-${secret.id}`}
            style={{ 
              width: "120px", 
              height: "160px", 
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
        </button>
      ))}
    </div>
  );
}
