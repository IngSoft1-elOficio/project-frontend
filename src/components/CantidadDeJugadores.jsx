export default function CantidadDeJugadores({ jugadores, setJugadores }) {
  const opciones = [2, 3, 4, 5, 6];

  return (
    <div>
      <label className="flex items-start text-[#FFD700]">Cantidad de jugadores:</label>
      <div className="cantidad-jugadores-container">
        {opciones.map((num) => (
          <button
            key={num}
            onClick={() => setJugadores(num)}
            className={`btn-cantidad-jugador ${jugadores === num ? "btn-cantidad-jugador-activo" : ""}`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
