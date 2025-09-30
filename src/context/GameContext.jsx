// GameContext.js
import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

const gameInitialState = {
  gameId: null,
  roomId: null,
  turnoActual: null,
  started: null,
  jugadores: [],
  mazos: {},
  mano: [],
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
    case 'SET_GAME_ID':
      return {
        ...state,
        gameId: action.payload
      };
    case 'INITIALIZE_GAME':
      return {
        ...state,
        gameId: action.payload.room.game_id,  
        roomId: action.payload.room.id,       
        roomInfo: action.payload.room,
        jugadores: action.payload.players
      };
    case 'UPDATE_GAME_STATE_PUBLIC':
    return {
      ...state,
      roomId: action.payload.room_id || state.roomId,
      gameId: action.payload.game_id || state.gameId,
      started: action.payload.status,
      turnoActual: action.payload.turno_actual,
      jugadores: action.payload.jugadores,
      mazos: action.payload.mazos,
      gameEnded: action.payload.game_ended || false,  // Add this
      lastUpdate: action.payload.timestamp
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
    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, gameInitialState);
  const socketRef = useRef(null);

  // Function to connect to socket
  const connectToGame = useCallback((roomId, userId) => {
    // Disconnect existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('Connecting to game:', roomId);

    const socket = io('http://localhost:8000', {
      query: {
        room_id: roomId,
        user_id: userId
      },
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected to game:', roomId);
      gameDispatch({ type: 'SOCKET_CONNECTED' });
    });

    socket.on('connected', (data) => {
      console.log('✅ Backend confirmed connection and auto-joined room:', roomId);
      gameDispatch({ type: 'SOCKET_CONNECTED' });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      gameDispatch({ type: 'SOCKET_DISCONNECTED' });
    });

    // Game events
    socket.on('game_state_public', (data) => {
      console.log('🔵 Received game_state_public:', data);
      gameDispatch({
        type: 'UPDATE_GAME_STATE_PUBLIC',
        payload: data  // Just pass the whole data object
      });
    });

    socket.on('game_state_private', (data) => {
      console.log('🟢 Received game_state_private:', data);
      gameDispatch({ type: 'UPDATE_GAME_STATE_PRIVATE', payload: data });
      console.log("updated game state private");
    });

    // Add a catch-all listener to see ALL events
    socket.onAny((eventName, ...args) => {
      console.log('📡 Socket received event:', eventName, args);
    });

    socket.on('player_action_result', (data) => {
      if (data.type === 'game_ended') {
        gameDispatch({ type: 'GAME_ENDED', payload: data });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('game_finished', (data) => {
      console.log('🏁 Game finished:', data);
      gameDispatch({ 
        type: 'GAME_ENDED', 
        payload: { 
          ganaste: data.winners.some(w => w.player_id === userId),
          reason: data.reason 
        } 
      });
    });
  }, []);

  // Function to disconnect from socket
  const disconnectFromGame = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting from game: room_id = ', room_id);
      socketRef.current.disconnect();
      socketRef.current = null;
      gameDispatch({ type: 'SOCKET_DISCONNECTED' });
    }
  }, []);

  return (
    <GameContext.Provider value={{ gameState, gameDispatch, connectToGame, disconnectFromGame  }}>
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