export default function NombreDePartida({ nombre, setNombre }) {
  return (
    <div>
      <label>Nombre de la partida: </label>
      <input
        type="text"
        value={nombre}
        maxLength={20}
        onChange={(e) => setNombre(e.target.value)}
      />
    </div>
  );
}
