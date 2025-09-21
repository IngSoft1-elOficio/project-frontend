export default function Continuar({ nombre, jugadores, onContinue, setError }) {
  const validar = () => {
    if (!nombre.trim()) {
      setError("El nombre de la partida no puede estar vacío");
      return;
    }
    if (!jugadores) {
      setError("Selecciona la cantidad de jugadores");
      return;
    }
    setError("");
    onContinue();
  };

  return (
    <div className="flex flex-col items-start">
      <button onClick={validar} className="btn-continuar">
        Crear Partida
      </button>
    </div>
  );
}
