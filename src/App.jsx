import { Routes, Route } from "react-router-dom";
import PantallaDeCreacion from "./containers/PantallaDeCreacion";

export default function App() {
  return (
    <Routes>
      <Route path="/newgame" element={<PantallaDeCreacion />} />
    </Routes>
  );
}
