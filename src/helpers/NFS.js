import { useGame } from "../context/GameContext";
import { useUser } from "../context/UserContext";

export const startActionWithCounterCheck = async ({
  roomId,
  userId,
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
    /*
    const checkResp = await fetch(
      `http://localhost:8000/api/game/${roomId}/counter/check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "http-user-id": userId.toString(),
        },
        body: JSON.stringify({
          intended_action: endpoint.replace(/^\//, ""),
          intended_payload: payload,
        }),
      }
    );

    const checkData = await checkResp.json();
    if (!checkResp.ok) {
      throw new Error(checkData.detail || "Counter check failed");
    }
    */
    // 2. No counter → run original action
    //if (!checkData.counter_window) {
      return await callOriginalEndpoint({
        roomId,
        userId,
        endpoint,
        payload,
        successDispatch,
      });
    //}
    /*
    // 3. Counter window opened → store and wait
    gameDispatch({
      type: "COUNTER_WINDOW_STARTED",
      payload: {
        actionId: checkData.action_id,
        originalEndpoint: endpoint,
        originalPayload: payload,
        successDispatch,
      },
    });

    setError("Ventana de contra abierta – esperando respuestas…");
    setTimeout(() => setError(null), 4000);
    */
  } catch (err) {
    console.error("Counter check error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

/**
 * Calls the *real* endpoint (same as before)
 */
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