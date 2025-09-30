// components/ConnectionBeacon.jsx
import { useGame } from "../context/GameContext";

export default function ConnectionBeacon() {
  const { gameState } = useGame();
  const { connected } = gameState;

  return (
    <div
      className={`fixed top-4 right-4 flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow-lg transition-all duration-300
        ${connected ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
    >
      <span
        className={`h-3 w-3 rounded-full animate-pulse ${
          connected ? "bg-white" : "bg-black"
        }`}
      />
      {connected ? "Conectado" : "Desconectado"}
    </div>
  );
}
