// src/components/PlayersList.jsx
export default function PlayersList({ players = [], ownerId }) {
  if (!players || players.length === 0) {
    return (
      <p className="px-6 py-4 italic text-[#B49150]/80">
        Aún no hay jugadores.
      </p>
    );
  }

  // Helper para obtener un identificador estable del jugador
  const getPid = (p) => p?.id ?? p?.userId ?? p?.uid ?? p?.name;

  return (
    <ul className="divide-y divide-[#825012]/40">
      {players.map((p, i) => {
        const pid = getPid(p);
        const isHost =
          ownerId != null && String(pid) === String(ownerId);

        return (
          <li
            key={pid ?? i}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="truncate">
              {isHost && (
                <span role="img" aria-label="host" className="mr-2">
                  👑
                </span>
              )}
              {p?.name ?? pid ?? `Jugador ${i + 1}`}
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
