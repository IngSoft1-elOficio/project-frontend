import { useState } from "react";
import { useGame } from "../context/GameContext";
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

export default function HandCards() {
  const { gameState, gameDispatch } = useGame();
  const hand = gameState.mano || [];

  const normalizeName = (name = "") =>
    name
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, " ");

  const IMAGE_MAP = {
    "lady eileen bundle brent": brent,
    "miss marple": marple,
    "ariadne oliver": oliver,
    "hercule poirot": poirot,
    "parker pyne": pyne,
    "harley quin wildcard": quin,
    "mr satterthwaite": satterthwaite,
    "tommy beresford": tommyberesford,
    "tuppence beresford": tuppenceberesford,
    "blackmailed": blackmailed,
    "social faux pas": fauxpas,
    "another victim": anothervictim,
    "cards off the table": cardsonthetable,
    "card trade": cardtrade,
    "dead card folly": deadcardfolly,
    "delay the murderer escape": delayescape,
    "early train to paddington": earlytrain,
    "look into the ashes": lookashes,
    "and then there was one more": onemore,
    "point your suspicions": pointsuspicions,
    "not so fast you fiend": notsofast
  };

  const getCardsImage = (card) => {
    if (!card || !card.name) return null;
    const key = normalizeName(card.name);
    return IMAGE_MAP[key] ?? null;
  };

  const cardSelected = (card) => {
    gameDispatch({ type: "TOGGLE_SELECT_CARD", payload: card.id });
  };

  return (
    <div style={{
      display: "flex",
      gap: "12px",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      minHeight: "170vh"
    }}>
      {hand.map((card) => {
        const src = getCardsImage(card);
        const isSelected = card.is_in === "SELECT";

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => cardSelected(card)}
            style={{
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: isSelected ? "0 0 0 3px rgba(255,209,92,0.95)" : "none"
            }}
          >
              <img
                src={src}
                alt={card.name}
                style={{ width: 80, height: 110, objectFit: "cover", display: "block", borderRadius: 6 }}
              />
          </button>
        );
      })}
    </div>
  );
}
