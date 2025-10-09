export default function Deck({ cardsLeft }) {
    return (
        <div className="flex flex-col items-center">
            <div className="top-card">
                <img src={"/cards/01-card_back.png"} alt="Top Discarded Card" className="w-16 h-24 rounded-lg border-2 border-gray-400" />
            </div>
            <div className="mt-2 text-white">
                {cardsLeft}
            </div>
        </div>
    );
}
