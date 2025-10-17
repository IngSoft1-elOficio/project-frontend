import React from "react";
import ProfileCard from "../ProfileCard";
import Button from "../Button";

const SelectPlayerModal = ({ 
  isOpen, 
  onClose,
  jugadores,
  userId,
  currentEventType,
  detectiveType,
  anotherVictim,
  detectiveAction,
  onPlayerSelect,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const modalLayout = "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-6 flex flex-col items-center gap-6";
  const playersContainer = "grid grid-cols-2 md:grid-cols-3 gap-4 w-full justify-center";
  const actionMessage = "text-[#FFE0B2] text-xl font-semibold text-center";
  const buttonContainer = "flex gap-4 justify-center w-full";

  const initiatorPlayerId = detectiveAction?.actionInProgress?.initiatorPlayerId;
  const isInitiator = initiatorPlayerId === userId;
  const isTarget = detectiveAction?.actionInProgress?.targetPlayerId === userId;

  const getActionMessage = () => {
    // Caso 1: Another Victim
    if (currentEventType === "another_victim") {
      const selectedPlayer = anotherVictim?.selectedPlayer;
      return selectedPlayer
        ? `Robar set de detective de ${selectedPlayer.name}`
        : "Selecciona un jugador para robar su set de detective";
    }

    // Caso 2: Detectives Tipo A
    if (["marple", "pyne", "poirot"].includes(detectiveType)) {
      const selected = detectiveAction?.selectedPlayer;
      return selected
        ? `Robar secreto de ${selected.name}`
        : "Selecciona un jugador para robar su secreto";
    }

    // Caso 3: Detectives Tipo B
    if (["beresford", "satterthwaite"].includes(detectiveType)) {
      if (isInitiator) {
        const selected = detectiveAction?.selectedPlayer;
        return selected
          ? `Jugador seleccionado: ${selected.name}`
          : "Selecciona un jugador objetivo";
      } else if (isTarget) {
        const initiatorPlayer = jugadores.find(
          (j) => j.id === initiatorPlayerId
        );
        return `Has sido seleccionado por ${initiatorPlayer?.name || "un jugador"}. Confirma para elegir un secreto.`;
      }
    }

    return "";
  };

  const playersToShow = jugadores.filter((j) => {
    if (j.id === userId) return false;

    if (["beresford", "satterthwaite"].includes(detectiveType)) {
      if (isInitiator) return j.id !== initiatorPlayerId;
      if (isTarget) return false;
    }

    return true;
  });


  const showPlayerList = 
    playersToShow.length > 0 && (
      currentEventType === "another_victim" ||
      ["marple", "pyne", "poirot"].includes(detectiveType) ||
      (["beresford", "satterthwaite"].includes(detectiveType) && isInitiator)
    );

  // Determinar si el botón de confirmar está habilitado
  const isConfirmEnabled = () => {
    if (currentEventType === "another_victim") {
      return !!anotherVictim?.selectedPlayer;
    }
    if (["marple", "pyne", "poirot"].includes(detectiveType)) {
      return !!detectiveAction?.selectedPlayer;
    }
    if (["beresford", "satterthwaite"].includes(detectiveType)) {
      if (isInitiator) {
        return !!detectiveAction?.selectedPlayer;
      }
      if (isTarget) {
        return true; // Jugador objetivo solo confirma
      }
    }
    return false;
  };

  // ID del jugador seleccionado (para resaltar)
  const selectedPlayerId = 
    anotherVictim?.selectedPlayer?.id || 
    detectiveAction?.selectedPlayer?.id;

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>
        {/* Lista de jugadores (solo si corresponde) */}
        {showPlayerList && (
          <div className={playersContainer}>
            {playersToShow.map((jugador) => (
              <div
                key={jugador.id}
                onClick={() => onPlayerSelect(jugador)}
                className={`cursor-pointer hover:scale-105 transition-all ${
                  selectedPlayerId === jugador.id
                    ? "ring-4 ring-[#FFD700]"
                    : ""
                }`}
              >
                <ProfileCard
                  name={jugador.name}
                  avatar={jugador.avatar}
                  birthdate={new Date(jugador.birthdate).toLocaleDateString()}
                />
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de acción */}
        <div className={actionMessage}>
          <h2>{getActionMessage()}</h2>
        </div>

        {/* Botones de confirmación/cancelación */}
        <div className={buttonContainer}>
          <Button 
            onClick={onConfirm} 
            title="Confirmar"
            disabled={!isConfirmEnabled()}
          >
            Confirmar
          </Button>
          <Button onClick={onCancel} title="Cancelar">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerModal;