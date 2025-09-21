export default function Continuar({ nombre, jugadores, onContinue }) {
  const validar = () => {
    if (!nombre.trim()) {
      alert("El nombre de la partida no puede estar vacío");
      return;
    }
    if (!jugadores) {
      alert("Selecciona la cantidad de jugadores");
      return;
    }
    onContinue();
  };

  return (
    <button onClick={validar} className="
    bg-[#3D0800] text-[#B49150] border-2 border-[#825012]
    px-5 py-2.5 rounded-xl font-bold cursor-pointer
    "
    >
      Crear Partida
    </button>
  );
}
