// mocks/realtime.js
function createEmitter() {
  const handlers = new Map(); 
  return {
    on(event, fn) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event).add(fn);
    },
    off(event, fn) {
      const set = handlers.get(event);
      if (set) set.delete(fn);
    },
    _emit(event, payload) {
      const set = handlers.get(event);
      if (set) for (const fn of set) fn(payload);
    },
    _clear() { handlers.clear(); }
  };
}

class MockSocket {
  constructor() {
    this.emitter = createEmitter();
    this.connected = false;
    this._timers = [];
    this._participantsByGame = new Map(); 
    this._current = { gameId: null, userId: null };
  }

  connect() {
    this.connected = true;
    setTimeout(() => {
      this.emitter._emit("connected", { message: "Conectado exitosamente" });
    }, 50);
  }

  disconnect() {
    this.connected = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this.emitter._clear();
  }

  on(ev, fn)  { this.emitter.on(ev, fn); }
  off(ev, fn) { this.emitter.off(ev, fn); }

  emit(event, payload) {
    if (event === "join_game") {
      const { game_id, user_id } = payload;
      this._current = { gameId: String(game_id), userId: String(user_id) };
      const key = String(game_id);
      if (!this._participantsByGame.has(key)) {
        this._participantsByGame.set(key, new Map());
      }
      const room = this._participantsByGame.get(key);
      // agrego al propio usuario si no está
      if (!room.has(String(user_id))) {
        room.set(String(user_id), {
          user_id: String(user_id),
          connected_at: new Date().toISOString(),
          sid: "mock-" + Math.random().toString(36).slice(2, 7),
        });
      }
    }

    if (event === "get_participants") {
      const { game_id } = payload;
      const room = this._participantsByGame.get(String(game_id)) || new Map();
      const participants_list = [...room.values()];
      setTimeout(() => {
        this.emitter._emit("get_participants", { participants_list });
      }, 80);
    }
  }

  startTimeline() {
    const { gameId } = this._current;
    if (!gameId) return;
    const push = (user_id, delayMs) => {
      const t = setTimeout(() => {
        const room = this._participantsByGame.get(gameId);
        room.set(String(user_id), {
          user_id: String(user_id),
          connected_at: new Date().toISOString(),
          sid: "mock-" + Math.random().toString(36).slice(2, 7),
        });
        this.emitter._emit("player_connected", {
          user_id: String(user_id),
          game_id: gameId,
          timestamp: new Date().toISOString(),
        });
      }, delayMs);
      this._timers.push(t);
    };

    push("u2", 1200);
    push("u3", 2400);
    push("u4", 3600);
  }
}

export const socket = new MockSocket();


export function bootMockRealtime({ gameId, userId }) {
  socket.connect();
  socket.emit("join_game", { game_id: gameId, user_id: userId });
  socket.emit("get_participants", { game_id: gameId });
  socket.startTimeline(); 
}
