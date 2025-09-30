import { useGame } from "../context/GameContext";
import cardback from "../assets/01-card_back.png";
import murderescape from "../assets/02-murder_escapes.png";
import brent from "../assets/detective_brent.png";
import marple from "../assets/detective_marple.png";
import oliver from "../assets/detective_oliver.png";
import poirot from "../assets/detective_poirot.png";
import pyne from "../assets/detective_pyne.png";
import quin from "../assets/detective_quin.png";
import satterthwaite from "../assets/detective_satterthwaite.png";
import tommyberesford from "../assets/detective_tommyberesford.png";
import tuppenceberesford from "../assets/detective_tuppenceberesford.png";
import blackmailed from "../assets/devious_blackmailed.png";
import fauxpas from "../assets/devious_fauxpas.png";
import anothervictim from "../assets/event_anothervictim.png";
import cardsonthetable from "../assets/event_cardsonthetable.png";
import cardtrade from "../assets/event_cardtrade.png";
import deadcardfolly from "../assets/event_deadcardfolly.png";
import delayescape from "../assets/event_delayescape.png";
import earlytrain from "../assets/event_earlytrain.png";
import lookashes from "../assets/event_lookashes.png";
import onemore from "../assets/event_onemore.png";
import pointsuspicions from "../assets/event_pointsuspicions.png";
import notsofast from "../assets/instant_notsofast.png";

export default function HandCards({ selectedCards, onSelect }) {
  const { gameState } = useGame()
  const hand = gameState.mano || []

  const normalizeName = (name = '') =>
    name
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ')

  const IMAGE_MAP = {
    "card back": cardback,
    "murder escapes": murderescape,
    "detective poirot": poirot,
    "detective marple": marple,
    "detective satterthwaite": satterthwaite,
    "detective pyne": pyne,
    "detective brent": brent,
    "detective tommy beresford": tommyberesford,
    "detective tuppence beresford": tuppenceberesford,
    "detective quin": quin,
    "detective oliver": oliver,
    "instant not so fast": notsofast,
    "event cards on the table": cardsonthetable,
    "event another victim": anothervictim,
    "event dead card folly": deadcardfolly,
    "event look ashes": lookashes,
    "event card trade": cardtrade,
    "event one more": onemore,
    "event delay escape": delayescape,
    "event early train": earlytrain,
    "event point suspicions": pointsuspicions,
    "devious blackmailed": blackmailed,
    "devious faux pas": fauxpas
  };

  const getCardsImage = card => {
    if (!card || !card.name) return null
    const key = normalizeName(card.name)
    return IMAGE_MAP[key] ?? null
  }

  return (
    <div style={{
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      maxWidth: "1200px"
    }}>
      {hand.map((card) => {
        const src = getCardsImage(card);
        const isSelected = selectedCards.includes(card.id);
        
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            style={{
              border: "none",
              background: "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              padding: 0,
              outline: isSelected ? "box-shadow: 0 0 0 3px gold" : "none",
              transition: "all 0.2s ease"
            }}
          >
            {src ? (
              <img
                src={src}
                alt={card.name}
                style={{ 
                  width: "120px", 
                  height: "160px", 
                  objectFit: "cover", 
                  display: "block", 
                  borderRadius: "8px" 
                }}
              />
            ) : (
              <div style={{
                width: "120px",
                height: "160px",
                background: "#333",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                textAlign: "center",
                padding: "8px"
              }}>
                {card.name}
              </div>
            )}
          </button>
        )
      })}
    </div>
  );
}