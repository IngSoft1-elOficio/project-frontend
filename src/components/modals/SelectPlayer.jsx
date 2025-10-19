import ProfileCard from "../ProfileCard";
import Button from "../Button";
import { useState } from "react";
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'

const SelectPlayerModal = ({ onPlayerSelect }) => {

  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const { userState } = useUser()
  const { gameState } = useGame()

  const modalLayout = "fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-60";
  const modalContainer =
    "bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-[90%] max-w-3xl p-6 flex flex-col items-center gap-6";
  const playersContainer = "grid grid-cols-2 md:grid-cols-3 gap-4 w-full justify-center";
  const actionMessage = "text-[#FFE0B2] text-xl font-semibold text-center";
  const buttonContainer = "flex gap-4 justify-center w-full";

  const playersToShow = gameState.jugadores.filter((j) => { 
    return j.player_id != userState.id 
  });
  
  const confirmSelection = () => {
    if (selectedPlayerId) onPlayerSelect(selectedPlayerId);
  }

  return (
    <div className={modalLayout}>
      <div className={modalContainer}>

        {/* Lista de jugadores (solo si corresponde) */}
          <div className={playersContainer}>
            {playersToShow.map((jugador) => (
              <div
                key={jugador.player_id}
                onClick={() => setSelectedPlayerId(jugador.player_id)}
                className={`cursor-pointer hover:scale-105 transition-all ${
                  selectedPlayerId === jugador.player_id
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

        {/* Mensaje de acción */}
        <div className={actionMessage}>
          <h2>Selecciona un jugador</h2>
        </div>

        {/* Botones de confirmación/cancelación */}
        <div className={buttonContainer}>
          <Button 
            onClick={() => confirmSelection()} 
            title="Confirmar"
            disabled={false}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlayerModal;