import React from "react";
import { useGame } from "../../context/GameContext";
import ProfileCard from "../ProfileCard";
import Button from "../Button";

const SelectPlayerModal = () => {
  const { gameState, gameDispatch } = useGame();
  const { jugadores = [], roomId, userId } = gameState;
  const { anotherVictim } = gameState.eventCards;

  if (!anotherVictim?.showSelectPlayer) return null;

  const modalLayout = '';
  const playersContainer = '';
  const actionMessage = '';
  const buttonContainer = '';

  const handlePlayerSelect = (jugador) => {
    gameDispatch({ type: "EVENT_ANOTHER_VICTIM_SELECT_PLAYER", payload: jugador });
  };

  // Confirma la acción con el backend
  const handleConfirm = async () => {
    const selectedPlayer = anotherVictim.selectedPlayer;
    if (!selectedPlayer) return;

    try {
      const response = await fetch(
        `/api/game/${roomId}/event/another-victim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card_id: anotherVictim.cardId,
            target_player_id: selectedPlayer.id,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al seleccionar jugador");
      const data = await response.json();

      gameDispatch({ type: "EVENT_STEP_UPDATED", payload: data });
    } catch (error) {
      console.error("Error en Another Victim:", error);
      gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
    }
  };

  const handleCancel = () =>
    gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });

  // Mensaje dinámico según tipo de acción
  const getActionMessage = () => {
    const { actionInProgress } = gameState.eventCards;
    const { detectiveAction } = gameState;

    // Another Victim
    if (actionInProgress?.eventType === "another_victim") {
      const selectedPlayer = anotherVictim.selectedPlayer;
      return selectedPlayer
        ? `Robar set de detective de ${selectedPlayer.name}`
        : "Robar set de detective...";
    }

    // Detective Action
    if (detectiveAction.actionInProgress?.step === "started") {
      const targetPlayer = gameState.jugadores.find(
        (j) => j.id === detectiveAction.actionInProgress.targetPlayerId
      );
      return targetPlayer
        ? `Robar secreto de ${targetPlayer.name}`
        : "Robar secreto...";
    }

    return "";
  };

  return (
    <div className={modalLayout}>
      <div className={playersContainer}>
        {jugadores
          .filter((j) => j.id !== userId)
          .map((jugador) => (
            <div
              key={jugador.id}
              onClick={() => handlePlayerSelect(jugador)}
              className="cursor-pointer hover:scale-105 transition-all"
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
          disabled={!anotherVictim.selectedPlayer}
        >
          Seleccionar
        </Button>

        <Button onClick={handleCancel} title="Cancelar acción">
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default SelectPlayerModal;
