export default function PlayersList({ players = [], hostId }) {
      
  return (
    <ul className="divide-y divide-[#825012]/40">
      {players.map((p,i) => {
      const playerId = p.user_id;
      const isHost = hostId == playerId;

        return (
          <li
            key={playerId}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="truncate">
              {isHost && (
                <span role="img" aria-label="host" className="mr-2">
                  👑
                </span>
              )}
              {p?.nombre ?? `Jugador ${i + 1}`}
            </span>

            <span className="text-sm opacity-80">
              {isHost ? "Host" : "Jugador"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
