import { useState } from "react";
import NombreDePartida from "../components/NombreDePartida";

export default function PantallaDeCreacion() {
  const [nombre, setNombre] = useState("");

  return (
    <div className="pantalla-creacion">
      <div className="form-container">
        <NombreDePartida nombre={nombre} setNombre={setNombre} />
      </div>
    </div>
  );
}
