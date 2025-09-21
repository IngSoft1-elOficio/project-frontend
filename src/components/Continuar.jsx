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
    <button onClick={validar} className="btn-continuar">
      Continuar
    </button>
  );
}
