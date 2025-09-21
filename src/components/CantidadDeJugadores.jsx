export default function CantidadDeJugadores({ jugadores, setJugadores }) {
  const opciones = [2, 3, 4, 5, 6];

  return (
    <div>
      <label className="flex flex-col items-start text-[#FFD700]">Cantidad de jugadores:</label>
      <div className="flex flex-row gap-2 mt-2">
        {opciones.map((num) => (
          <button
            key={num}
            onClick={() => setJugadores(num)}
            className={`"
            w-10 h-10 border-2 border-[#825012] rounded-lg
            bg-[#3D0800] text-[#B49150] font-bold
            cursor-pointer flex items-center justify-center
            "
            ${jugadores === num ? " bg-[#FFD700] text-black border-[#B49150]" : ""}`}
            >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
