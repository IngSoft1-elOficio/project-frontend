import React, { useState } from "react";
import ButtonGame from "../ButtonGame.jsx";
import { useGame } from "../../context/GameContext.jsx";


const HideRevealStealSecretsModal = ({
  isOpen,
  onClose,
  detective,
}) => {
  if (!isOpen) return null;

  const { gameDispatch } = useGame();
  const setType = detective?.current?.setType || "Detective"; // me traigo al detective
  const wildcard = detective?.current?.hasWildcard || false; //tiene comodin?
  const secretos = detective?.metadata?.secretsPool || [] ;
  const isDetective = detective.showSelectSecret; // elijo secreto de jugador objetivo
  const isTarget = detective.showChooseOwnSecret; //jugador objetivo elije secreto a eleccion

  const filteredSecrets = secretos.filter((s) => s.playerId === detective.targetPlayerId); // secretos del objetivo

  const [selectedSecret, setSelectedSecret] = useState(null);

  // ====== INFO DEL DETECTIVE ======
  const detectiveInfo = {
    poirot: {
      name: "Hercule Poirot",
      effect: "Elige un secreto del jugador objetivo para revelar",
    },
    marple: {
      name: "Miss Marple",
      effect: "Elige un secreto del jugador objetivo para revelar",
    },
    satterthwaite: {
      name: "Mr. Satterthwaite",
      effect: "Elige un secreto propio para revelar",
    },
    pyne: {
      name: "Parker Pyne",
      effect: "Elige un secreto para ocultar",
    },
    eileenbrent: {
      name: "Lady Eileen 'Bundle' Brent",
      effect: "Elige un secreto propio para revelar",
    },
    tommyberesford: {
      name: "Tommy Beresford",
      effect: "Elige un secreto propio para revelar",
    },
    tuppenceberesford: {
      name: "Tuppence Beresford",
      effect: "Elige un secreto propio para revelar",
    },
  };

  const { name, effect } =
    detectiveInfo[setType?.toLowerCase()] || {
      name: "Detective desconocido",
      effect: "Sin efecto",
    };

  // ====== ACCIÓN PRINCIPAL ======
  const handleAction = async () => {
    if (!selectedSecret) return;

    try {
      const roomId = detective?.current?.roomId || detective?.roomId;
      const actionId = detective?.current?.actionId;
      const secretId = selectedSecret.cardId || selectedSecret.secretId;

      const body = {
        actionId,
        secretId,
      };

      if (isDetective) { //si es quien tiró el set tambien manda al jugador objtivo
        body.targetPlayerId = detective.targetPlayerId;
      }

      // llamamos al endpoint
      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/detective-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Error al ejecutar acción");
      }

      const data = await response.json();
      console.log("Acción detective completada:", data);

      // Notificar que se completó la acción
      gameDispatch({ type: "DETECTIVE_ACTION_COMPLETE" });

      onClose();
    } catch (error) {
      console.error(" Error al ejecutar acción de detective:", error);
    }
  };


    const overlay =
    "fixed inset-0 flex items-center justify-center z-50 bg-black/60";
  const container =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[720px] flex flex-col p-8";
  const headerStyle =
    "bg-[#640B01] text-[#B49150] border-b-4 border-[#825012] px-6 py-4 rounded-t-xl text-center";
  const headerTitle = "text-3xl font-bold";
  const description =
    "text-base text-[#B49150]/80 mt-4 mb-8 px-6 text-center leading-relaxed";
  const cardBox =
    "w-32 h-48 border-2 border-[#825012] bg-[#3D0800]/40 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:scale-105";
  const selectedCard = "border-[#B49150] scale-105";
  const buttonsContainer = "flex justify-center gap-6 mt-6";

  return (
    <div className={overlay}>
      <div className={container}>
        {/* HEADER */}
        <div className={headerStyle}>
          <h2 className={headerTitle}>{name}</h2>
        </div>

        {/* EFECTO */}
        <p className={description}>
          <strong>Efecto:</strong> {effect}
        </p>

        {/* SECRETOS */}
        <div className="flex justify-center gap-6 my-6">
          {filteredSecrets.map((secret) => (
            <div
              key={secret.position}
              onClick={() => setSelectedSecret(secret)}
              className={`${cardBox} ${
                selectedSecret?.position === secret.position ? selectedCard : ""
              }`}
            >
              {secret.hidden ? (
                <img
                  src="/cards/secret_back.png"
                  alt={`Secreto ${secret.position}`}
                  className="w-full h-full object-cover rounded-md opacity-90"
                />
              ) : (
                <img
                  src={`/cards/secret_${secret.cardId}.png`}
                  alt={`Secreto ${secret.position}`}
                  className="w-full h-full object-cover rounded-md"
                />
              )}
            </div>
          ))}
        </div>

        {/* BOTONES */}
        <div className={buttonsContainer}>
          <ButtonGame disabled={!selectedSecret} onClick={handleAction}>
            {setType?.toLowerCase() === "pyne" ? "Ocultar" : "Revelar"}
          </ButtonGame>
          <ButtonGame onClick={onClose}>Cancelar</ButtonGame>
        </div>

        {/* COMODÍN */}
        {wildcard && (
          <p className="text-xs mt-4 text-[#B49150]/60 text-center italic">
            * Este set contiene un comodín.
          </p>
        )}
      </div>
    </div>
  );
};

export default HideRevealStealSecretsModal;