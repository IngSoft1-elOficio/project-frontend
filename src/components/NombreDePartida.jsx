export default function NombreDePartida({ nombre, setNombre, setError }) {
  return (
    <div>
      <label className="text-[#FFD700]">Nombre de la partida: </label>
      <input
        type="text"
        value={nombre}
        maxLength={20}
        onChange={(e) => 
          { 
            setNombre(e.target.value);
            setError("");
          }
        }
        className="nombre-partida-input"
      />
    </div>
  );
}
