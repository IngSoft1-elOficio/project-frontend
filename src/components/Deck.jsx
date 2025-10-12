export default function Deck({ cardsLeft, onClick, disabled }) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`top-card ${!disabled ? 'cursor-pointer hover:scale-105 transition-transform' : 'opacity-50 cursor-not-allowed'}`}
        onClick={!disabled ? onClick : undefined}
      >
        <img 
          src={"/cards/01-card_back.png"} 
          alt="Top Discarded Card" 
          className="w-16 h-24 rounded-lg border-2 border-gray-400" 
        />
      </div>
      <div className="mt-2 text-white">
        {cardsLeft}
      </div>
    </div>
  );
}