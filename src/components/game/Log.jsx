
import { useGame } from '../../context/GameContext.jsx';
import { useEffect, useRef } from 'react';

export default function Log() {
  const { gameState } = useGame();
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.logs]);

  const getLogColor = (type) => {
    switch (type) {
      case 'draw': return 'text-blue-300';
      case 'discard': return 'text-cyan-300';
      case 'detective': return 'text-purple-300';
      case 'event': return 'text-yellow-300';
      case 'turn': return 'text-green-300';
      case 'game': return 'text-red-300';
      default: return 'text-gray-400';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'draw': return '➕';
      case 'discard': return '🗑️';
      case 'detective': return '🔍';
      case 'event': return '⚡';
      case 'turn': return '🔄';
      default: return '•';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return '';
    
    const player = gameState.jugadores.find(j => j.player_id == playerId);

    return player ? player.name : `Jugador ${playerId}`;
  };

  const formatMessage = (message) => {
    // Match patterns like "Player 30" or "Jugador 30"
    return message.replace(/Player (\d+)/gi, (match, playerId) => {
      return getPlayerName(parseInt(playerId));
    }).replace(/Jugador (\d+)/gi, (match, playerId) => {
      return getPlayerName(parseInt(playerId));
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold p-0">Logger</h1>
        <span className="text-xs text-gray-400">
          {gameState.logs.length} eventos
        </span>
      </div>
      
      <div className="bg-white/10 rounded-lg p-3 text-sm max-h-[40vh] overflow-y-auto space-y-2">
        {gameState.logs.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            Esperando eventos del juego...
          </p>
        ) : (
          gameState.logs.map((log) => (
            <div
              key={log.id}
              className={`${getLogColor(log.type)} flex gap-2 items-start py-1 border-b border-white/5 last:border-0`}
            >
              <span className="text-lg">{getLogIcon(log.type)}</span>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-500 text-xs">
                    {formatTime(log.timestamp)}
                  </span>
                  {log.playerId && (
                    <span className="text-xs font-semibold text-white/70">
                      {getPlayerName(log.playerId)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5">{formatMessage(log.message)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
