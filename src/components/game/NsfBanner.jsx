// components/game/CounterBanner.jsx
import { useGame } from "../../context/GameContext";
import { useUser } from "../../context/UserContext";
import ButtonGame from "../common/ButtonGame";

export default function NsfBanner({ handler }) {
    const { gameState } = useGame();
    const { userState } = useUser();
    const nsfWindow = gameState.nsfCounter;

    if (!nsfWindow.active) return null;

    // Find initiator player info
    const initiator = gameState.jugadores?.find(
        player => player.id === nsfWindow.initiatorPlayerId
    );

    // Check if current user is the initiator
    const isInitiator = userState.id === nsfWindow.initiatorPlayerId;

  return (
    <div className="mb-4 p-3 bg-yellow-600 text-white rounded-lg shadow-lg animate-pulse max-w-sm h-full">
        {/* Header */}
        <div className="text-center mb-2">
            <strong className="text-base">⚠️ Ventana de Contra</strong>
            <p className="text-xs text-yellow-100 mt-0.5">Todos pueden contraatacar</p>
        </div>

        {/* Time Remaining */}
        <div className="text-center mb-2">
            <div className="inline-block bg-yellow-700 px-3 py-1.5 rounded">
            <span className="text-xs">Tiempo:</span>
            <span className="text-xl font-bold ml-1">{nsfWindow.timeRemaining}s</span>
            </div>
        </div>

        {/* Initiator Info */}
        <div className="mb-2 text-center text-sm">
            <p className="text-xs text-yellow-100">Iniciado por:</p>
            <p className="font-semibold">
            {initiator?.name || 'Jugador desconocido'}
            {isInitiator && ' (Tú)'}
            </p>
            {nsfWindow.actionName && (
            <p className="text-xs text-yellow-100 mt-0.5">
                {nsfWindow.actionName}
            </p>
            )}
        </div>

        {/* NSF Chain */}
        {nsfWindow.nsfChain && nsfWindow.nsfChain.length > 0 && (
            <div className="border-t border-yellow-500 pt-2">
            <p className="text-xs font-semibold mb-1.5 text-center">
                Contras ({nsfWindow.nsfChain.length}):
            </p>
            <div className="space-y-1">
                {nsfWindow.nsfChain.map((nsf, index) => {
                const player = gameState.jugadores?.find(p => p.id === nsf.playerId);
                const isCurrentUser = userState.id === nsf.playerId;
                
                return (
                    <div 
                    key={`${nsf.playerId}-${nsf.timestamp}`}
                    className="bg-yellow-700 px-2 py-1 rounded text-xs flex items-center justify-between"
                    >
                    <span>
                        {index + 1}. {player?.name || 'Jugador'}
                        {isCurrentUser && ' (Tú)'}
                    </span>
                    </div>
                );
                })}
            </div>
            </div>
        )}

        {/* Boton para jugar NSF*/}
        <div className="flex items-center justify-center w-full">
        <ButtonGame onClick={() => handler()}>Jugar NSF</ButtonGame>
        </div>
    </div>
  );
}