import React from "react";
import { useGame } from "@/context/GameContext";
import ProfileCard from "../ProfileCard";

const SelectPlayerModal = () => {
  const { gameState, gameDispatch } = useGame();
  const { jugadores = [], room_id, userId } = gameState;
  const { anotherVictim } = gameState.eventCards;

  if (!anotherVictim?.showSelectPlayer) return null;

  const handlePlayerSelect = async (jugadorSeleccionado) => {
    try {
      const response = await fetch(
        `/api/game/${room_id}/event/another-victim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            card_id: anotherVictim.cardId, // asumimos que está en el estado
            target_player_id: jugadorSeleccionado.id,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al seleccionar jugador");
      const data = await response.json();

      gameDispatch({ type: "EVENT_STEP_UPDATED", payload: data });
    } catch (error) {
      console.error("❌ Error en Another Victim:", error);
      gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });
    }
  };

  const handleCancel = () =>
    gameDispatch({ type: "EVENT_ANOTHER_VICTIM_COMPLETE" });

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

        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={() => handlePlayerSelect(selectedPlayer)}
            title="Confirmar acción"
            disabled={!selectedPlayer}
          >
            Seleccionar
          </Button>

          <Button
            onClick={handleCancel}
            title="Cancelar acción"
          >
            Cancelar
          </Button>
        </div>

      </div>
  );
};

export default SelectPlayerModal;
