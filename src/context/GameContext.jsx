// GameContext.js
import { createContext, useContext, useReducer, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

const gameInitialState = {
  gameId: null,
  turnoActual: null,
  jugadores: [],
  mazos: {},
  mano: [/*
        {
          player_id: 1,
          id: 1,
          name: "Miss Marple",
          type: "detective",
          img: "path/to/miss_marple.png",
          is_in: "HAND"
        },*/
  ],
  secretos: [],
  gameEnded: false,
  ganaste: null,
  lastUpdate: null,
  connected: false
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SOCKET_CONNECTED':
      return {
        ...state,
        connected: true
      };
    
    case 'SOCKET_DISCONNECTED':
      return {
        ...state,
        connected: false
      };
    
    case 'UPDATE_GAME_STATE_PUBLIC':
      return {
        ...state,
        gameId: action.payload.game_id,
        turnoActual: action.payload.turno_actual,
        jugadores: action.payload.jugadores,
        mazos: action.payload.mazos,
        lastUpdate: action.payload.timestamp,
        gameEnded: false
      };
    
    case 'UPDATE_GAME_STATE_PRIVATE':
      return {
        ...state,
        mano: action.payload.mano,
        secretos: action.payload.secretos,
        lastUpdate: action.payload.timestamp
      };
    
    case 'GAME_ENDED':
      return {
        ...state,
        gameEnded: true,
        ganaste: action.payload.ganaste,
        lastUpdate: action.payload.timestamp
      };
    
    case 'RESET_GAME':
      return gameInitialState;

    case 'TOGGLE_SELECT_CARD':
      return {
        ...state,
        mano: state.mano.map(carta =>
          carta.id === action.payload
            ? { ...carta, is_in: carta.is_in === "SELECT" ? "HAND" : "SELECT" }
            : carta
        )
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        mano: state.mano.map(carta => ({ ...carta, is_in: "HAND" }))
      };

    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, gameInitialState);

  useEffect(() => {
    const socket = io('http://localhost:8000');

    // Connection events
    socket.on('connect', () => {
      gameDispatch({ type: 'SOCKET_CONNECTED' });
    });

    socket.on('disconnect', () => {
      gameDispatch({ type: 'SOCKET_DISCONNECTED' });
    });

    // Game events
    socket.on('game_state_public', (data) => {
      gameDispatch({ 
        type: 'UPDATE_GAME_STATE_PUBLIC', 
        payload: data 
      });
    });

    socket.on('game_state_private', (data) => {
      gameDispatch({ 
        type: 'UPDATE_GAME_STATE_PRIVATE', 
        payload: data 
      });
    });

    socket.on('player_action_result', (data) => {
      if (data.type === 'game_ended') {
        gameDispatch({ 
          type: 'GAME_ENDED', 
          payload: data 
        });
      }
      // Agregar mas para player_action_result types
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <GameContext.Provider value={{ gameState, gameDispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
