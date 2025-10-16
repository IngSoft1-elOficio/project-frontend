import React from "react";
import { useGame } from "../../context/GameContext";
import ProfileCard from "../ProfileCard";
import Button from "../Button";

const SelectPlayerModal = ({ isOpen, onClose }) => {
  const { gameState, gameDispatch } = useGame();
  const { jugadores = [], roomId, userId } = gameState;
  const { anotherVictim } = gameState.eventCards;

  if (!isOpen) return null;

  const modalLayout = "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-6 flex flex-col items-center gap-6";
  const playersContainer = "grid grid-cols-2 md:grid-cols-3 gap-4 w-full justify-center";
  const actionMessage = "text-[#FFE0B2] text-xl font-semibold text-center";
  const buttonContainer = "flex gap-4 justify-center w-full";

  const handlePlayerSelect = (jugador) => {
    gameDispatch({ type: "EVENT_ANOTHER_VICTIM_SELECT_PLAYER", payload: jugador });
  };

  const handleConfirm = async () => {
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

      gameDispatch({ type: "EVENT_STEP_UPDATED", payload: data });
      onClose();
    } catch (error) {
      console.error("Error en Another Victim:", error);
      gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
      onClose();
    }
  };

  const handleCancel = () => {
    gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
    onClose();
  };

  const getActionMessage = () => {
    const { actionInProgress } = gameState.eventCards;
    const { detectiveAction } = gameState;

    if (actionInProgress?.eventType === "another_victim") {
      const selectedPlayer = anotherVictim?.selectedPlayer;
      return selectedPlayer
        ? `Robar set de detective de ${selectedPlayer.name}`
        : "Selecciona un jugador para robar su set de detective";
    }

    if (detectiveAction?.actionInProgress?.step === "started") {
      const targetPlayer = gameState.jugadores.find(
        (j) => j.id === detectiveAction.actionInProgress.targetPlayerId
      );
      return targetPlayer
        ? `Robar secreto de ${targetPlayer.name}`
        : "Selecciona un jugador para robar su secreto";
    }

    return "";
  };

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>
        <div className={playersContainer}>
          {jugadores
            .filter((j) => j.id !== userId)
            .map((jugador) => (
              <div
                key={jugador.id}
                onClick={() => handlePlayerSelect(jugador)}
                className={`cursor-pointer hover:scale-105 transition-all ${
                  anotherVictim?.selectedPlayer?.id === jugador.id ? "ring-4 ring-[#FFD700]" : ""
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

        <div className={actionMessage}>
          <h2>{getActionMessage()}</h2>
        </div>

        <div className={buttonContainer}>
          <Button
            onClick={handleConfirm}
            title="Confirmar acción"
            disabled={!anotherVictim?.selectedPlayer}
          >
            Confirmar
          </Button>

          <Button onClick={handleCancel} title="Cancelar acción">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerModal;
