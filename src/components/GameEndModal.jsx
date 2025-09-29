import { useNavigate } from "react-router-dom";

export default function GameEndModal({ message }) {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/lobby")
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-[#3D0800] border-4 border-[#825012] text-[#B49150] p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center font-limelight">
          Partida finalizada
        </h2>

        <p className="mb-6 text-center italic">{message}</p>

        <div className="flex justify-center">
          <button
            onClick={handleClose} 
            className="px-10 py-3 font-semibold transition border-4 
                       bg-[#3D0800] text-[#B49150] border-[#825012] 
                       hover:bg-[#4a0a00] focus:outline-none 
                       focus:ring-2 focus:ring-[#825012]/60"
          >
            Volver al Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
