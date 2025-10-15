// GameContext.js
import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
} from 'react'
import io from 'socket.io-client'

const GameContext = createContext()

const gameInitialState = {
  userId: null,
  gameId: null,
  roomId: null,
  turnoActual: null,
  status: null,
  jugadores: [],
  mazos: {
    deck: {
      count: 0,
      draft: [],
    },
    discard: {
      top: '',
      count: 0,
    },
  },
  sets: [],
  mano: [],
  secretos: [],
  gameEnded: false,
  winners: [],
  ganaste: null,
  finish_reason: null,
  lastUpdate: null,
  connected: false,

  // Detective Actions
  detectiveAction: {
    // Active action
    current: null, // { actionId, setType, stage, cards, hasWildcard }
    allowedPlayers: [],
    secretsPool: 'hidden', // 'hidden' | 'revealed'
    targetPlayerId: null,

    // Modals
    showCreateSet: false,
    showSelectPlayer: false,
    showSelectSecret: false,
    showWaiting: false,

    incomingRequest: null, // { actionId, requesterId, setType }
    showChooseOwnSecret: false,

    // Transparency
    actionInProgress: null, // { playerId, setType, step, message }
  },

  // Event Cards
  eventCards: {
    // Cards Off The Table
    cardsOffTable: {
      showSelectPlayer: false,
    },

    // Another Victim
    anotherVictim: {
      showSelectPlayer: false,
    },

    // Look Into Ashes
    lookAshes: {
      actionId: null,
      availableCards: [],
      showSelectCard: false,
    },

    // And Then There Was One More
    oneMore: {
      actionId: null,
      availableSecrets: [],
      allowedPlayers: [],
      selectedSecretId: null,
      showSelectSecret: false,
      showSelectPlayer: false,
    },

    // Delay The Murderer Escape
    delayEscape: {
      actionId: null,
      availableCards: [],
      showOrderCards: false,
    },

    // Transparency for all events
    actionInProgress: null, // { playerId, eventType, step, message }
  },

  // Simple discard & draw tracking
  drawAction: {
    cardsToDrawRemaining: 0, // How many more cards player needs to draw
    otherPlayerDrawing: null, // { playerId, cardsRemaining, message }
    hasDiscarded: false,
    hasDrawn: false,
  },
}

const gameReducer = (state, action) => {
  switch (action.type) {
    // -------------------
    // | GAME-CONNECTION |
    // -------------------

    case 'SOCKET_CONNECTED':
      return {
        ...state,
        connected: true,
      }

    case 'SOCKET_DISCONNECTED':
      return {
        ...state,
        connected: false,
      }

    case 'SET_GAME_ID':
      return {
        ...state,
        gameId: action.payload,
      }

    case 'INITIALIZE_GAME':
      return {
        ...state,
        gameId: action.payload.room.game_id,
        roomId: action.payload.room.id,
        roomInfo: action.payload.room,
        jugadores: action.payload.players,
      }

    case 'UPDATE_GAME_STATE_PUBLIC':
      return {
        ...state,
        roomId: action.payload.room_id ?? state.roomId,
        gameId: action.payload.game_id ?? state.gameId,
        status: action.payload.status ?? state.status,
        turnoActual: action.payload.turno_actual ?? state.turnoActual,

        jugadores:
          Array.isArray(action.payload.jugadores) &&
          action.payload.jugadores.length > 0
            ? action.payload.jugadores
            : state.jugadores,

        mazos:
          action.payload.mazos && Object.keys(action.payload.mazos).length > 0
            ? action.payload.mazos
            : state.mazos,

        sets:
          Array.isArray(action.payload.sets) && action.payload.sets.length > 0
            ? action.payload.sets
            : state.sets,

        gameEnded: action.payload.game_ended ?? state.gameEnded,
        lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
      }

    case 'UPDATE_GAME_STATE_PRIVATE':
      return {
        ...state,
        userId: action.payload.user_id ?? state.userId,
        mano: Array.isArray(action.payload.mano)
          ? action.payload.mano
          : state.mano,

        secretos: Array.isArray(action.payload.secretos)
          ? action.payload.secretos
          : state.secretos,

        lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
      }

    case 'GAME_ENDED':
      return {
        ...state,
        gameEnded: true,
        ganaste: action.payload.ganaste ?? false,

        winners: Array.isArray(action.payload.winners)
          ? action.payload.winners
          : state.winners,

        finish_reason: action.payload.reason,

        lastUpdate: action.payload.timestamp ?? new Date().toISOString(),
      }

    // ----------------------
    // | CARDS DRAW-DISCARD |
    // ----------------------
    case 'PLAYER_MUST_DRAW':
      console.log(
        'PLAYER_MUST_DRAW, cardsToDrawRemaining = ',
        action.payload.cards_to_draw
      )
      const isMe = action.payload.player_id === state.userId

      return {
        ...state,
        drawAction: {
          cardsToDrawRemaining: isMe ? action.payload.cards_to_draw : 0,
          otherPlayerDrawing: !isMe
            ? {
                playerId: action.payload.player_id,
                cardsRemaining: action.payload.cards_to_draw,
                message: action.payload.message,
              }
            : null,
          hasDiscarded: true,
          hasDrawn: false,
        },
      }

    case 'CARD_DRAWN_SIMPLE':
      const isMeDrawing = action.payload.player_id === state.userId
      const cardsRemaining = action.payload.cards_remaining

      return {
        ...state,
        drawAction: {
          cardsToDrawRemaining: isMeDrawing
            ? cardsRemaining
            : state.drawAction.cardsToDrawRemaining,
          otherPlayerDrawing:
            !isMeDrawing && cardsRemaining > 0
              ? {
                  playerId: action.payload.player_id,
                  cardsRemaining: cardsRemaining,
                  message: action.payload.message,
                }
              : null,
          hasDiscarded: state.drawAction.hasDiscarded,
          hasDrawn: cardsRemaining === 0 ? true : state.drawAction.hasDrawn,
        },
      }

    case 'DRAW_ACTION_COMPLETE':
      console.log('DRAW_ACTION_COMPLETE')
      return {
        ...state,
        drawAction: {
          cardsToDrawRemaining: 0,
          otherPlayerDrawing: null,
          hasDiscarded: true,
          hasDrawn: true,
        },
      }

    case 'FINISH_TURN':
      console.log('FINISH_TURN')
      return {
        ...state,
        drawAction: {
          cardsToDrawRemaining: 0,
          otherPlayerDrawing: null,
          hasDiscarded: false,
          hasDrawn: false,
        },
      }

    // ---------------------
    // | DETECTIVE ACTIONS |
    // ---------------------

    case 'DETECTIVE_ACTION_STARTED':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          actionInProgress: {
            playerId: action.payload.player_id,
            setType: action.payload.set_type,
            step: 'started',
            message: action.payload.message,
          },
        },
      }

    case 'DETECTIVE_TARGET_SELECTED':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          actionInProgress: {
            ...state.detectiveAction.actionInProgress,
            targetPlayerId: action.payload.target_player_id,
            step: 'waiting_for_secret',
            message: action.payload.message,
          },
        },
      }

    case 'DETECTIVE_START_CREATE_SET':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          showCreateSet: true,
        },
      }

    case 'DETECTIVE_SET_SUBMITTED':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          current: {
            actionId: action.payload.actionId,
            setType: action.payload.setType,
            stage: action.payload.stage,
            cards: action.payload.cards,
            hasWildcard: action.payload.hasWildcard,
          },
          allowedPlayers: action.payload.allowedPlayers,
          secretsPool: action.payload.secretsPool,
          showCreateSet: false,
          showSelectPlayer: true,
        },
      }

    case 'DETECTIVE_PLAYER_SELECTED':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          targetPlayerId: action.payload.playerId,
          showSelectPlayer: false,
          showSelectSecret: action.payload.needsSecret,
          showWaiting: !action.payload.needsSecret,
        },
      }

    case 'DETECTIVE_INCOMING_REQUEST':
      return {
        ...state,
        detectiveAction: {
          ...state.detectiveAction,
          incomingRequest: {
            actionId: action.payload.action_id,
            requesterId: action.payload.requester_id,
            setType: action.payload.set_type,
          },
          showChooseOwnSecret: true,
        },
      }

    case 'DETECTIVE_ACTION_COMPLETE':
      return {
        ...state,
        detectiveAction: {
          current: null,
          allowedPlayers: [],
          secretsPool: 'hidden',
          targetPlayerId: null,
          showCreateSet: false,
          showSelectPlayer: false,
          showSelectSecret: false,
          showWaiting: false,
          incomingRequest: null,
          showChooseOwnSecret: false,
          actionInProgress: null,
        },
      }

    // ---------------
    // | EVENT CARDS |
    // ---------------

    case 'EVENT_ACTION_STARTED':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          actionInProgress: {
            playerId: action.payload.player_id,
            eventType: action.payload.event_type,
            cardName: action.payload.card_name,
            step: action.payload.step,
            message:
              action.payload.message ||
              `Playing ${action.payload.card_name}...`,
          },
        },
      }

    case 'EVENT_STEP_UPDATE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          actionInProgress: {
            ...state.eventCards.actionInProgress,
            step: action.payload.step,
            message: action.payload.message,
          },
        },
      }

    case 'EVENT_CARDS_OFF_TABLE_START':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          cardsOffTable: { showSelectPlayer: true },
        },
      }

    case 'EVENT_CARDS_OFF_TABLE_COMPLETE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          cardsOffTable: { showSelectPlayer: false },
          actionInProgress: null,
        },
      }

    case 'EVENT_LOOK_ASHES_PLAYED':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          lookAshes: {
            actionId: action.payload.action_id,
            availableCards: action.payload.available_cards,
            showSelectCard: true,
          },
        },
      }

    case 'EVENT_ANOTHER_VICTIM_START':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          anotherVictim: {
            ...state.eventCards.anotherVictim,
            showSelectPlayer: true,
            cardId: action.payload?.cardId || null,
            selectedPlayer: null, // inicializa en null
          },
          actionInProgress: {
            playerId: action.payload?.playerId,
            eventType: 'another_victim',
            step: 'select_player',
            message: 'Selecciona un jugador objetivo',
          },
        },
      }


    case 'EVENT_ANOTHER_VICTIM_COMPLETE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          anotherVictim: {
            ...state.eventCards.anotherVictim,
            showSelectPlayer: false,
            selectedPlayer: null,
            cardId: null,
          },
          actionInProgress: null,
        },
      }

    case 'EVENT_LOOK_ASHES_COMPLETE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          lookAshes: {
            actionId: null,
            availableCards: [],
            showSelectCard: false,
          },
          actionInProgress: null,
        },
      }

    case 'EVENT_ONE_MORE_PLAYED':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          oneMore: {
            ...state.eventCards.oneMore,
            actionId: action.payload.action_id,
            availableSecrets: action.payload.available_secrets,
            showSelectSecret: true,
          },
        },
      }

    case 'EVENT_ONE_MORE_SECRET_SELECTED':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          oneMore: {
            ...state.eventCards.oneMore,
            selectedSecretId: action.payload.secret_id,
            allowedPlayers: action.payload.allowed_players,
            showSelectSecret: false,
            showSelectPlayer: true,
          },
        },
      }

    case 'EVENT_ONE_MORE_COMPLETE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          oneMore: {
            actionId: null,
            availableSecrets: [],
            allowedPlayers: [],
            selectedSecretId: null,
            showSelectSecret: false,
            showSelectPlayer: false,
          },
          actionInProgress: null,
        },
      }

    case 'EVENT_DELAY_ESCAPE_PLAYED':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          delayEscape: {
            actionId: action.payload.action_id,
            availableCards: action.payload.available_cards,
            showOrderCards: true,
          },
        },
      }

    case 'EVENT_DELAY_ESCAPE_COMPLETE':
      return {
        ...state,
        eventCards: {
          ...state.eventCards,
          delayEscape: {
            actionId: null,
            availableCards: [],
            showOrderCards: false,
          },
          actionInProgress: null,
        },
      }

    default:
      return state
  }
}

export const GameProvider = ({ children }) => {
  const [gameState, gameDispatch] = useReducer(gameReducer, gameInitialState)
  const socketRef = useRef(null)

  // Function to connect to socket
  const connectToGame = useCallback((roomId, userId) => {
    // Disconnect existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    console.log('🔌 Connecting web-socket to roomId:', roomId)

    const socket = io('http://localhost:8000', {
      query: {
        room_id: roomId,
        user_id: userId,
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })

    socketRef.current = socket

    // -------------------------------
    // | CONNECTION ACTION LISTENERS |
    // -------------------------------

    socket.on('connected', data => {
      console.log('✅ Backend confirmed connection room:', roomId)
      gameDispatch({ type: 'SOCKET_CONNECTED' })
    })

    socket.on('disconnected', () => {
      console.log('❌ Socket disconnected')
      gameDispatch({ type: 'SOCKET_DISCONNECTED' })
    })

    socket.on('player_connected', () => {
      console.log('✅ Player joined room:', roomId)
    })

    socket.on('player_disconnected', () => {
      console.log('✅ Player leaved room:', roomId)
    })

    // ------------------------
    // | GAME STATE LISTENERS |
    // ------------------------

    socket.on('game_state_public', data => {
      console.log('📡 Received game_state_public:', data)
      gameDispatch({
        type: 'UPDATE_GAME_STATE_PUBLIC',
        payload: data,
      })
    })

    socket.on('game_state_private', data => {
      console.log('📡 Received game_state_private:', data)
      gameDispatch({ type: 'UPDATE_GAME_STATE_PRIVATE', payload: data })
      console.log('updated game state private')
    })

    socket.on('connect_error', error => {
      console.error('❌ Socket connection error:', error)
    })

    socket.on('game_ended', data => {
      console.log('🏁 Game finished:', data)
      gameDispatch({
        type: 'GAME_ENDED',
        payload: {
          ganaste: data.winners.some(w => w.player_id === userId),
          winners: data.winners,
          reason: data.reason,
        },
      })
    })

    // ------------------------------
    // | DETECTIVE ACTION LISTENERS |
    // ------------------------------

    socket.on('detective_action_started', data => {
      console.log('Detective action started:', data)
      gameDispatch({
        type: 'DETECTIVE_ACTION_STARTED',
        payload: data,
      })
    })

    socket.on('detective_target_selected', data => {
      console.log('Detective target selected:', data)
      gameDispatch({
        type: 'DETECTIVE_TARGET_SELECTED',
        payload: data,
      })
    })

    socket.on('select_own_secret', data => {
      console.log('Must select own secret:', data)
      gameDispatch({
        type: 'DETECTIVE_INCOMING_REQUEST',
        payload: data,
      })
    })

    socket.on('detective_action_complete', data => {
      console.log('✅ Detective action complete:', data)
      gameDispatch({ type: 'DETECTIVE_ACTION_COMPLETE' })
    })

    // ------------------------
    // | EVENT CARD LISTENERS |
    // ------------------------

    socket.on('event_action_started', data => {
      console.log('Event action started:', data)
      gameDispatch({
        type: 'EVENT_ACTION_STARTED',
        payload: data,
      })
    })

    socket.on('event_step_update', data => {
      console.log('Event step update:', data)
      gameDispatch({
        type: 'EVENT_STEP_UPDATE',
        payload: data,
      })
    })

    socket.on('event_action_complete', data => {
      console.log('✅ Event action complete:', data)
      // Specific event completion handled by game_state_public
    })

    // ------------------------
    // | DRAW-DISCARD CARD LISTENERS |
    // ------------------------

    socket.on('player_must_draw', data => {
      console.log('Player must draw cards:', data)
      gameDispatch({
        type: 'PLAYER_MUST_DRAW',
        payload: data,
      })
    })

    socket.on('card_drawn_simple', data => {
      console.log('Card drawn:', data)
      gameDispatch({
        type: 'CARD_DRAWN_SIMPLE',
        payload: data,
      })
    })

    socket.on('turn_finished', data => {
      console.log('✅ Turn finished:', data)
      gameDispatch({ type: 'FINISH_TURN' })
    })
  }, [])

  // Function to disconnect from socket
  const disconnectFromGame = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting from RoomId = ', gameState.roomId)
      socketRef.current.disconnect()
      socketRef.current = null
      gameDispatch({ type: 'SOCKET_DISCONNECTED' })
    }
  }, [gameState.roomId])

  return (
    <GameContext.Provider
      value={{ gameState, gameDispatch, connectToGame, disconnectFromGame }}
    >
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
