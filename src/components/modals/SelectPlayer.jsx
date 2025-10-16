import React from "react";
import { useGame } from "../../context/GameContext";
import ProfileCard from "../ProfileCard";
import Button from "../Button";

const SelectPlayerModal = ({ isOpen, onClose }) => {
  const { gameState, gameDispatch } = useGame();
  const { jugadores = [], roomId, userId } = gameState;
  const { anotherVictim, actionInProgress } = gameState.eventCards;
  const { detectiveAction } = gameState;

  if (!isOpen) return null;

  const modalLayout = "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-6 flex flex-col items-center gap-6";
  const playersContainer = "grid grid-cols-2 md:grid-cols-3 gap-4 w-full justify-center";
  const actionMessage = "text-[#FFE0B2] text-xl font-semibold text-center";
  const buttonContainer = "flex gap-4 justify-center w-full";

  const currentEventType = actionInProgress?.eventType;
  const detectiveType = detectiveAction?.actionInProgress?.setType;
  
  // Para Tipo B: El jugador que JUGÓ el set es el "initiator"
  // El jugador SELECCIONADO es el "target" que luego se vuelve activo
  const initiatorPlayerId = detectiveAction?.actionInProgress?.initiatorPlayerId;
  const isInitiator = initiatorPlayerId === userId; // Quien jugó el set
  const isTarget = detectiveAction?.actionInProgress?.targetPlayerId === userId; // Quien fue seleccionado

  const handlePlayerSelect = (jugador) => {
    // Caso 1: Another Victim - Solo guardar selección
    if (currentEventType === "another_victim") {
      gameDispatch({ 
        type: "EVENT_ANOTHER_VICTIM_SELECT_PLAYER", 
        payload: jugador 
      });
      return;
    }

    // Caso 2: Detectives Tipo A (marple, pyne, poirot) - Solo guardar selección
    if (["marple", "pyne", "poirot"].includes(detectiveType)) {
      gameDispatch({
        type: "DETECTIVE_PLAYER_SELECTED",
        payload: { playerId: jugador.id, playerData: jugador }
      });
      return;
    }

    // Caso 3: Detectives Tipo B (beresford, satterthwaite) - Solo guardar selección si es el iniciador
    if (["beresford", "satterthwaite"].includes(detectiveType) && isInitiator) {
      gameDispatch({
        type: "DETECTIVE_PLAYER_SELECTED",
        payload: { playerId: jugador.id, playerData: jugador }
      });
    }
  };

  const handleConfirm = async () => {
    // CASO 1: Another Victim - Hacer POST al backend
    if (currentEventType === "another_victim") {
      const selectedPlayer = anotherVictim?.selectedPlayer;
      if (!selectedPlayer) return;

      try {
        const response = await fetch(`/api/game/${roomId}/event/another-victim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card_id: anotherVictim.cardId,
            target_player_id: selectedPlayer.id,
          }),
        });

        if (!response.ok) throw new Error("Error al seleccionar jugador");
        const data = await response.json();

        gameDispatch({ type: "EVENT_STEP_UPDATE", payload: data });
        onClose();
      } catch (error) {
        console.error("Error en Another Victim:", error);
        gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
        onClose();
      }
      return;
    }

    // CASO 2: Detectives Tipo A (marple, pyne, poirot) - Abrir modal de secretos
    if (["marple", "pyne", "poirot"].includes(detectiveType)) {
      const selectedPlayer = detectiveAction?.selectedPlayer;
      if (!selectedPlayer) return;

      // Cerrar este modal y abrir el modal de AccionSobreSecretos
      gameDispatch({
        type: "DETECTIVE_OPEN_SECRET_SELECTION",
        payload: { 
          targetPlayer: selectedPlayer,
          detectiveType: detectiveType
        }
      });
      onClose();
      return;
    }

    // CASO 3: Detectives Tipo B (beresford, satterthwaite) - Dos fases
    if (["beresford", "satterthwaite"].includes(detectiveType)) {
      if (isInitiator) {
        // Fase 1: Jugador que jugó el set confirma su selección
        const selectedPlayer = detectiveAction?.selectedPlayer;
        if (!selectedPlayer) return;

        gameDispatch({
          type: "DETECTIVE_TARGET_CONFIRMED",
          payload: { 
            targetPlayerId: selectedPlayer.id,
            targetPlayerData: selectedPlayer
          }
        });
        onClose();
      } else if (isTarget) {
        // Fase 2: Jugador seleccionado confirma y se abre su modal de secretos
        gameDispatch({
          type: "DETECTIVE_TARGET_ACKNOWLEDGED_OPEN_SECRETS",
          payload: { 
            playerId: userId,
            initiatorPlayerId: initiatorPlayerId
          }
        });
        onClose();
      }
    }
  };

  const handleCancel = () => {
    if (currentEventType === "another_victim") {
      gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
    } else if (detectiveType) {
      gameDispatch({ type: "DETECTIVE_ACTION_COMPLETE" });
    }
    onClose();
  };

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

  // Jugadores disponibles para seleccionar (todos excepto el usuario actual)
  const playersToShow = jugadores.filter((j) => j.id !== userId);

  // Mostrar lista de jugadores solo en casos específicos
  const showPlayerList = 
    currentEventType === "another_victim" ||
    ["marple", "pyne", "poirot"].includes(detectiveType) ||
    (["beresford", "satterthwaite"].includes(detectiveType) && isInitiator);

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
        {showPlayerList && (
          <div className={playersContainer}>
            {playersToShow.map((jugador) => (
              <div
                key={jugador.id}
                onClick={() => handlePlayerSelect(jugador)}
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

        <div className={actionMessage}>
          <h2>{getActionMessage()}</h2>
        </div>

        <div className={buttonContainer}>
          <Button 
            onClick={handleConfirm} 
            title="Confirmar"
            disabled={!isConfirmEnabled()}
          >
            Confirmar
          </Button>
          <Button onClick={handleCancel} title="Cancelar">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerModal;