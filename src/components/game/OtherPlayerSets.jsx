import { useGame } from '../../context/GameContext.jsx';

export const OtherPlayerSets = ({ player }) => {
  const { gameState } = useGame();

  const playerDetectiveSets = gameState.sets.filter(
    set => set.owner_id === player.player_id );

  return (
    <div className="">
      <h2 className="text-white text-xl font-bold mb-2 text-center">
        Sets
      </h2>
        <div className="space-y-2">
          {playerDetectiveSets.length > 0 ? (
            playerDetectiveSets.map((set, index) => (
              <div
                key={`${set.owner_id}-${index}`}
                className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
              >
                <p>{`SET ${index}`}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-2">
              No tiene detective sets aún
            </p>
          )}
        </div>
    </div>
  );
};