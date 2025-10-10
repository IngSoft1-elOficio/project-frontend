import { useGame } from "../../context/GameContext"

export default function Draft({ handleDraft }) {
    const { gameState } = useGame()
    const draft = gameState.mazos.deck.draft || []

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
    "detective poirot": "/cards/detective_poirot.png",
    "detective marple": "/cards/detective_marple.png",
    "detective satterthwaite": "/cards/detective_satterthwaite.png",
    "detective pyne": "/cards/detective_pyne.png",
    "detective brent": "/cards/detective_brent.png",
    "detective tommy beresford": "/cards/detective_tommyberesford.png",
    "detective tuppence beresford": "/cards/detective_tuppenceberesford.png",
    "detective quin": "/cards/detective_quin.png",
    "detective oliver": "/cards/detective_oliver.png",
    "instant not so fast": "/cards/instant_notsofast.png",
    "event cards on the table": "/cards/event_cardsonthetable.png",
    "event another victim": "/cards/event_anothervictim.png",
    "event dead card folly": "/cards/event_deadcardfolly.png",
    "event look ashes": "/cards/event_lookashes.png",
    "event card trade": "/cards/event_cardtrade.png",
    "event one more": "/cards/event_onemore.png",
    "event delay escape": "/cards/event_delayescape.png",
    "event early train": "/cards/event_earlytrain.png",
    "event point suspicions": "/cards/event_pointsuspicions.png",
    "devious blackmailed": "/cards/devious_blackmailed.png",
    "devious faux pas": "/cards/devious_fauxpas.png"
  };

  const getCardsImage = card => {
    if (!card || !card.name) return null
    const key = normalizeName(card.name)
    return IMAGE_MAP[key] ?? null
  }

    return (
        <div>
            {draft.map((card) => {
                const src = getCardsImage(card);
                return (
                    <button
                        key={card.id}
                        type="button"
                        onClick={() => handleDraft(card.id)}
                    >
                    {src && <img src={src} alt={card.name} />}
                    </button>
                );
            })}
        </div>
    );
}
