import { useGame } from "../../context/GameContext"
import getCardsImage from "../HelperImageCards"

export default function Draft({ handleDraft }) {
    const { gameState } = useGame()
    const draft = gameState.mazos.deck.draft

  return (
    <div className="flex flex-row gap-6 justify-center items-center">
        {draft.map((card) => {
          const src = getCardsImage(card);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleDraft(card.id)}
              className="bg-transparent border-none p-0 cursor-pointer"
            >
            {src ? (
              <img src={src} alt={card.name} className="w-24 h-32 object-cover rounded-lg shadow-lg" />
            ) : (
              <div className="w-32 h-44 bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm">
                {card.name}
              </div>
            )}
            </button>
          );
        })
      }
    </div>
  );
}
