import { useState } from "react";
import NombreDePartida from "../components/NombreDePartida";
import CantidadDeJugadores from "../components/CantidadDeJugadores";

export default function PantallaDeCreacion() {
  const [nombre, setNombre] = useState("");
  const [jugadores, setJugadores] = useState(null);
  
  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        <NombreDePartida nombre={nombre} setNombre={setNombre} />
        <CantidadDeJugadores jugadores={jugadores} setJugadores={setJugadores} />
      </div>
    </div>
  );
}
