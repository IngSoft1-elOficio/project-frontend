import { useGame } from "../context/GameContext";
import { useUser } from "../context/UserContext";

export const startActionWithCounterCheck = async ({
  roomId,
  userId,
  cardsIds,
  actionType,           // "EVENT", "CREATE_SET", "ADD_TO_SET"
  setPosition,
  endpoint,           // "/play-detective-set" o otro
  payload,            // body del endpoint real 
  successDispatch,    // callback para cuando es exitoso el post
  setLoading,
  setError,
  gameDispatch,
}) => {
  if (!setLoading || !setError) {
    throw new Error("setLoading and setError are required");
  }

  setLoading(true);
  setError(null);

  try {
    // 1. Check if counter window is needed
    const request = {
        playerId: userId, // ID del jugador que inicia la acción
        cardIds: cardsIds, // Lista de IDs de cartas (cardsXgame.id) jugadas en la acción
        additionalData: { // Datos adicionales de la acción
            actionType: actionType, 
            setPosition: setPosition ? setPosition : null, // Posición del set al que se agrega la carta (obligatorio si actionType=ADD_TO_SET)")
        }
    }

    console.log(request);
    const response = await fetch(
      `http://localhost:8000/api/game/${roomId}/start-action`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "http-user-id": userId.toString(),
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Start Action Failed");
    }

    // 2. No counter → run original action
    if (!data.cancellable) {
      return await callOriginalEndpoint({
        roomId,
        userId,
        endpoint,
        payload,
        successDispatch,
      });
    }

    // 3. Counter window opened → store and wait
    gameDispatch({
        type: 'SAVE_ACTION_DATA', 
        payload: { 
            cards: cardsIds,  // {cardsxgame.id}
            endpoint: endpoint, 
            body: payload,
        }
    });

    setError("Ventana de contra abierta – esperando respuestas…");
    setTimeout(() => setError(null), 4000);
  } catch (err) {
    console.error("Counter check error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

export const callOriginalEndpoint = async ({
  roomId,
  userId,
  endpoint,
  payload,
  successDispatch,
}) => {
  const resp = await fetch(
    `http://localhost:8000/api/game/${roomId}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "http-user-id": userId.toString(),
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.detail || "Action failed");
  }

  if (successDispatch) successDispatch(data);
  return data;
};

export const playNotSoFast = async (card, userId, roomId, actionId, setError) => {
    console.log('CARD FOR NSF: ', card );
    console.log('PLAYER WHO COUNTERS: ', userId)
    console.log('ACTIONID ', actionId);

    try {
      const request = {
        actionId: actionId,
        playerId: userId,
        cardId: card.id,
      }
      const response = await fetch(
        `http://localhost:8000/api/game/${roomId}/instant/not-so-fast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "http-user-id": userId.toString(),
          },
          body: JSON.stringify(request),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Action failed");
      }

      console.log("NSF PLAYED RESPONSE, ", data);
      
    } catch (err) {
      setError(err.message);
    }

    return true;
}