// Mock del WebSocket: “empuja” jugadores que se van uniendo
export function mockSubscribeToGame(id, onMessage) {
  const timeline = [
    { delay: 2000, msg:  { id: "u2", name: "Jugador 2"   }  },
    { delay: 4000, msg:  { id: "u3", name: "Jugador 3" }  },
    { delay: 6000, msg: { id: "u4", name: "Jugador 4"   }  },
  ];

  const timers = timeline.map(({ delay, msg }) =>
    setTimeout(() => onMessage(msg), delay)
  );

  // cleanup (como ws.close())
  return () => timers.forEach(clearTimeout);
}
