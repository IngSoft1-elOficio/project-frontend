import React, { useState } from "react";
import ButtonGame from "../ButtonGame.jsx";
import { useGame } from '../../context/GameContext.jsx'

const HideRevealStealSecretsModal = ({
  isOpen,
  detective,
  onConfirm,
}) => {
  const { gameState } = useGame()

  if (!isOpen) return null;

  const setType = detective?.actionInProgress?.setType || "Detective";
  
  // Get targetPlayerId from actionInProgress, not from detective root
  const targetPlayerId = detective?.actionInProgress?.targetPlayerId;
  
  // Always use secretsFromAllPlayers as it has the 'id' field needed for the API
  const filteredSecrets = gameState.secretsFromAllPlayers.filter(
    (s) => s.player_id == targetPlayerId
  );

  console.log('Target Player ID:', targetPlayerId);
  console.log('Filtered Secrets:', filteredSecrets);
  console.log('First secret structure:', filteredSecrets[0]);

  const hasWildcard = detective?.current?.hasWildcard || false;

  const [selectedSecret, setSelectedSecret] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ====== INFO DEL DETECTIVE ======
  const detectiveInfo = {
    poirot: {
      name: "Hercule Poirot",
      effect: "Elegí un secreto del jugador objetivo para revelar",
      requiresHidden: true,
    },
    marple: {
      name: "Miss Marple",
      effect: "Elegí un secreto del jugador objetivo para revelar",
      requiresHidden: true,
    },
    satterthwaite: {
      name: "Mr. Satterthwaite",
      effect: "Elegí un secreto propio para revelar. ",
      requiresHidden: true,
    },
    pyne: {
      name: "Parker Pyne",
      effect: "Elegí un secreto para ocultar",
      requiresHidden: false,
    },
    eileenbrent: {
      name: "Lady Eileen 'Bundle' Brent",
      effect: "Elegí un secreto propio para revelar",
      requiresHidden: true,
    },
    tommyberesford: {
      name: "Tommy Beresford",
      effect: "Elegí un secreto propio para revelar",
      requiresHidden: true,
    },
    tuppenceberesford: {
      name: "Tuppence Beresford",
      effect: "Elegí un secreto propio para revelar",
      requiresHidden: true,
    },
  };

  const { name, effect, requiresHidden } =
    detectiveInfo[setType?.toLowerCase()] || {
      name: "Detective desconocido",
      effect: "Sin efecto",
      requiresHidden: null,
    };

  // ====== LÓGICA DEL EFECTO ======
  let finalEffect = effect;
  if (setType?.toLowerCase() === "satterthwaite" && hasWildcard) {
    finalEffect +=
      " Como este set se jugó con Harley Quin, el secreto revelado se agrega boca abajo a tus secretos.";
  }

  // ====== FUNCIONES ======
  const validateSecrets = (secret) => {
    if (requiresHidden && !secret.hidden) {
      setErrorMsg("Solo podés seleccionar secretos ocultos.");
      setSelectedSecret(null);
      return;
    }
    if (requiresHidden === false && secret.hidden) {
      setErrorMsg("Solo podés seleccionar secretos revelados.");
      setSelectedSecret(null);
      return;
    }
    setErrorMsg("");
    setSelectedSecret(secret);
  };

  const confirmSelection = () => {
    if (!selectedSecret) {
      setErrorMsg("Seleccioná un secreto válido antes de confirmar.");
      return;
    }
    onConfirm(selectedSecret);
  };

  // ====== ESTILOS ======
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
           {finalEffect}
        </p>

        {/* ERROR */}
        {errorMsg && (
          <p className="text-red-400 text-center font-semibold mb-3">
            {errorMsg}
          </p>
        )}

        {/* SECRETOS */}
        <div className="flex justify-center gap-6 my-6 flex-wrap">
          {filteredSecrets.length > 0 ? (
            filteredSecrets.map((secret) => (
              <div
                key={secret.position}
                onClick={() => validateSecrets(secret)}
                className={`${cardBox} ${
                  selectedSecret?.position === secret.position ? selectedCard : ""
                }`}
              >
                {secret.hidden ? (
                  <img
                    src="/cards/secret_front.png"
                    alt={`Secreto ${secret.position}`}
                    className="w-full h-full object-cover rounded-md opacity-90"
                  />
                ) : (
                  <img
                    src="/cards/secret_back.png"
                    alt={`Secreto ${secret.position}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-[#B49150]/60 text-center">
              No hay secretos disponibles para seleccionar
            </p>
          )}
        </div>

        {/* BOTONES */}
        <div className={buttonsContainer}>
          <ButtonGame disabled={!selectedSecret} onClick={confirmSelection}>
            {setType?.toLowerCase() === "pyne" ? "Ocultar" : "Revelar"}
          </ButtonGame>
        </div>
      </div>
    </div>
  );
};

export default HideRevealStealSecretsModal;