import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GameProvider, useGame } from '../context/GameContext'
import io from 'socket.io-client'

// Mock socket.io-client
vi.mock('socket.io-client')

describe('GameContext', () => {
  let mockSocket
  
  beforeEach(() => {
    // Create a mock socket with event listeners
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connected: false
    }
    
    // Mock io to return our mock socket
    io.mockReturnValue(mockSocket)
    
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Provider Initialization', () => {
    it('provides initial game state', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      expect(result.current.gameState).toEqual(expect.objectContaining({
        gameId: null,
        roomId: null,
        turnoActual: null,
        status: null,
        jugadores: [],
        mano: [],
        secretos: [],
        gameEnded: false,
        connected: false
      }))
    })
    
    it('provides connectToGame function', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      expect(result.current.connectToGame).toBeDefined()
      expect(typeof result.current.connectToGame).toBe('function')
    })
    
    it('provides disconnectFromGame function', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      expect(result.current.disconnectFromGame).toBeDefined()
      expect(typeof result.current.disconnectFromGame).toBe('function')
    })
    
    it('provides gameDispatch function', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      expect(result.current.gameDispatch).toBeDefined()
      expect(typeof result.current.gameDispatch).toBe('function')
    })
  })

  describe('Socket Connection', () => {
    it('connects to socket with correct parameters', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      expect(io).toHaveBeenCalledWith('http://localhost:8000', {
        query: {
          room_id: 'room-123',
          user_id: 'user-456'
        },
        transports: ['websocket', 'polling'],
        forceNew: true
      })
    })
    
    it('registers all socket event listeners', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const registeredEvents = mockSocket.on.mock.calls.map(call => call[0])
      
      // Connection events
      expect(registeredEvents).toContain('connected')
      expect(registeredEvents).toContain('disconnected')
      expect(registeredEvents).toContain('player_connected')
      expect(registeredEvents).toContain('player_disconnected')
      
      // Game state events
      expect(registeredEvents).toContain('game_state_public')
      expect(registeredEvents).toContain('game_state_private')
      expect(registeredEvents).toContain('game_ended')
      expect(registeredEvents).toContain('connect_error')
      
      // Detective action events
      expect(registeredEvents).toContain('detective_action_started')
      expect(registeredEvents).toContain('detective_target_selected')
      expect(registeredEvents).toContain('select_own_secret')
      expect(registeredEvents).toContain('detective_action_complete')
      
      // Event card events
      expect(registeredEvents).toContain('event_action_started')
      expect(registeredEvents).toContain('event_step_update')
      expect(registeredEvents).toContain('event_action_complete')
      
      // Draw/discard events
      expect(registeredEvents).toContain('player_must_draw')
      expect(registeredEvents).toContain('card_drawn_simple')
    })
    
    it('disconnects existing socket before creating new connection', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      // First connection
      act(() => {
        result.current.connectToGame('room-1', 'user-1')
      })
      
      const firstSocket = mockSocket
      
      // Create new mock for second connection
      const secondMockSocket = {
        on: vi.fn(),
        emit: vi.fn(),
        disconnect: vi.fn()
      }
      io.mockReturnValue(secondMockSocket)
      
      // Second connection
      act(() => {
        result.current.connectToGame('room-2', 'user-2')
      })
      
      expect(firstSocket.disconnect).toHaveBeenCalled()
    })
    
    it('updates connected state when socket connects', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      // Find and trigger the 'connected' event handler
      const connectedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connected'
      )[1]
      
      act(() => {
        connectedHandler({ message: 'Connected to room' })
      })
      
      expect(result.current.gameState.connected).toBe(true)
    })
    
    it('updates connected state when socket disconnects', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      // Connect first
      const connectedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connected'
      )[1]
      act(() => connectedHandler({}))
      
      // Then disconnect
      const disconnectedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnected'
      )[1]
      
      act(() => {
        disconnectedHandler()
      })
      
      expect(result.current.gameState.connected).toBe(false)
    })
  })

  describe('Game State Updates', () => {
    it('updates public game state', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const gameStateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'game_state_public'
      )[1]
      
      const publicData = {
        room_id: 'room-123',
        game_id: 'game-789',
        status: 'in_progress',
        turno_actual: 1,
        jugadores: [
          { id: 1, name: 'Player1' },
          { id: 2, name: 'Player2' }
        ],
        mazos: {
          deck: { count: 20, draft: [] },
          discard: { top: 'card-5', count: 3 }
        },
        sets: [{ id: 1, cards: [] }],
        game_ended: false,
        timestamp: '2025-01-01T00:00:00Z'
      }
      
      act(() => {
        gameStateHandler(publicData)
      })
      
      expect(result.current.gameState).toEqual(expect.objectContaining({
        roomId: 'room-123',
        gameId: 'game-789',
        status: 'in_progress',
        turnoActual: 1,
        jugadores: publicData.jugadores,
        mazos: publicData.mazos,
        sets: publicData.sets,
        gameEnded: false
      }))
    })
    
    it('updates private game state', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const privateStateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'game_state_private'
      )[1]
      
      const privateData = {
        mano: [
          { id: 'card-1', name: 'Card 1' },
          { id: 'card-2', name: 'Card 2' }
        ],
        secretos: [
          { id: 'secret-1', name: 'Secret 1' }
        ],
        timestamp: '2025-01-01T00:00:00Z'
      }
      
      act(() => {
        privateStateHandler(privateData)
      })
      
      expect(result.current.gameState.mano).toEqual(privateData.mano)
      expect(result.current.gameState.secretos).toEqual(privateData.secretos)
    })
    
    it('preserves existing state when partial update received', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const gameStateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'game_state_public'
      )[1]
      
      // First update with full data
      act(() => {
        gameStateHandler({
          room_id: 'room-123',
          turno_actual: 1,
          jugadores: [{ id: 1, name: 'Player1' }],
          mazos: { deck: { count: 20 } }
        })
      })
      
      // Second update with partial data
      act(() => {
        gameStateHandler({
          turno_actual: 2
        })
      })
      
      expect(result.current.gameState.turnoActual).toBe(2)
      expect(result.current.gameState.roomId).toBe('room-123')
      expect(result.current.gameState.jugadores).toEqual([{ id: 1, name: 'Player1' }])
    })
    
    it('handles game ended event', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const gameEndedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'game_ended'
      )[1]
      
      const endData = {
        winners: [
          { player_id: 'user-456', role: 'detective' }
        ],
        reason: 'All secrets revealed'
      }
      
      act(() => {
        gameEndedHandler(endData)
      })
      
      expect(result.current.gameState.gameEnded).toBe(true)
      expect(result.current.gameState.ganaste).toBe(true)
      expect(result.current.gameState.winners).toEqual(endData.winners)
    })
    
    it('marks player as loser when not in winners list', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const gameEndedHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'game_ended'
      )[1]
      
      act(() => {
        gameEndedHandler({
          winners: [{ player_id: 'other-user', role: 'detective' }]
        })
      })
      
      expect(result.current.gameState.ganaste).toBe(false)
    })
  })

  describe('Detective Actions', () => {
    it('handles detective action started', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'detective_action_started'
      )[1]
      
      act(() => {
        handler({
          player_id: 'user-123',
          set_type: 'murder_weapon',
          message: 'Detective action in progress'
        })
      })
      
      expect(result.current.gameState.detectiveAction.actionInProgress).toEqual({
        playerId: 'user-123',
        setType: 'murder_weapon',
        step: 'started',
        message: 'Detective action in progress'
      })
    })
    
    it('handles detective target selected', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      // First start action
      const startHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'detective_action_started'
      )[1]
      
      act(() => {
        startHandler({
          player_id: 'user-123',
          set_type: 'murder_weapon'
        })
      })
      
      // Then select target
      const targetHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'detective_target_selected'
      )[1]
      
      act(() => {
        targetHandler({
          target_player_id: 'user-789',
          message: 'Waiting for secret selection'
        })
      })
      
      expect(result.current.gameState.detectiveAction.actionInProgress).toEqual(
        expect.objectContaining({
          targetPlayerId: 'user-789',
          step: 'waiting_for_secret',
          message: 'Waiting for secret selection'
        })
      )
    })
    
    it('handles select own secret request', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'select_own_secret'
      )[1]
      
      act(() => {
        handler({
          action_id: 'action-123',
          requester_id: 'user-789',
          set_type: 'murder_scene'
        })
      })
      
      expect(result.current.gameState.detectiveAction.incomingRequest).toEqual({
        actionId: 'action-123',
        requesterId: 'user-789',
        setType: 'murder_scene'
      })
      expect(result.current.gameState.detectiveAction.showChooseOwnSecret).toBe(true)
    })
    
    it('handles detective action complete', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      // Set up some detective action state
      act(() => {
        result.current.gameDispatch({
          type: 'DETECTIVE_ACTION_STARTED',
          payload: { player_id: 'user-123', set_type: 'murder_weapon' }
        })
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'detective_action_complete'
      )[1]
      
      act(() => {
        handler({})
      })
      
      expect(result.current.gameState.detectiveAction).toEqual({
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
        actionInProgress: null
      })
    })
  })

  describe('Event Cards', () => {
    it('handles event action started', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'event_action_started'
      )[1]
      
      act(() => {
        handler({
          player_id: 'user-123',
          event_type: 'cards_off_table',
          card_name: 'Cards Off The Table',
          step: 'selecting_player',
          message: 'Select a player'
        })
      })
      
      expect(result.current.gameState.eventCards.actionInProgress).toEqual({
        playerId: 'user-123',
        eventType: 'cards_off_table',
        cardName: 'Cards Off The Table',
        step: 'selecting_player',
        message: 'Select a player'
      })
    })
    
    it('handles event step update', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      // Start event first
      const startHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'event_action_started'
      )[1]
      
      act(() => {
        startHandler({
          player_id: 'user-123',
          event_type: 'look_ashes',
          card_name: 'Look Into Ashes',
          step: 'started'
        })
      })
      
      // Update step
      const updateHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'event_step_update'
      )[1]
      
      act(() => {
        updateHandler({
          step: 'selecting_card',
          message: 'Select a card from ashes'
        })
      })
      
      expect(result.current.gameState.eventCards.actionInProgress).toEqual(
        expect.objectContaining({
          step: 'selecting_card',
          message: 'Select a card from ashes'
        })
      )
    })
  })

  describe('Draw Actions', () => {
    /*
    it('handles player must draw for current player', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'player_must_draw'
      )[1]
      
      act(() => {
        handler({
          player_id: 'user-456',
          cards_to_draw: 3,
          message: 'You must draw 3 cards'
        })
      })
      
      expect(result.current.gameState.drawAction.cardsToDrawRemaining).toBe(3)
      expect(result.current.gameState.drawAction.otherPlayerDrawing).toBeNull()
    })
    */
    it('handles player must draw for other player', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'player_must_draw'
      )[1]
      
      act(() => {
        handler({
          player_id: 'other-user',
          cards_to_draw: 2,
          message: 'Player X must draw 2 cards'
        })
      })
      
      expect(result.current.gameState.drawAction.cardsToDrawRemaining).toBe(0)
      expect(result.current.gameState.drawAction.otherPlayerDrawing).toEqual({
        playerId: 'other-user',
        cardsRemaining: 2,
        message: 'Player X must draw 2 cards'
      })
    })
    
    /*              DEscomentar cuando este implementada la logica del backend
    it('handles card drawn and updates remaining count', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'card_drawn_simple'
      )[1]
      
      act(() => {
        handler({
          player_id: 'user-456',
          cards_remaining: 1,
          message: '1 card left to draw'
        })
      })
      
      expect(result.current.gameState.drawAction.cardsToDrawRemaining).toBe(1)
    })
    */
    it('completes draw action when no cards remaining', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      const handler = mockSocket.on.mock.calls.find(
        call => call[0] === 'card_drawn_simple'
      )[1]
      
      act(() => {
        handler({
          player_id: 'user-456',
          cards_remaining: 0,
          message: 'All cards drawn'
        })
      })
      
      expect(result.current.gameState.drawAction.cardsToDrawRemaining).toBe(0)
      expect(result.current.gameState.drawAction.otherPlayerDrawing).toBeNull()
    })
  })

  describe('Manual Dispatch Actions', () => {
    it('allows manual dispatch of SET_GAME_ID', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.gameDispatch({
          type: 'SET_GAME_ID',
          payload: 'game-123'
        })
      })
      
      expect(result.current.gameState.gameId).toBe('game-123')
    })
    
    it('allows manual dispatch of INITIALIZE_GAME', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.gameDispatch({
          type: 'INITIALIZE_GAME',
          payload: {
            room: {
              id: 'room-123',
              game_id: 'game-456'
            },
            players: [
              { id: 1, name: 'Player1' },
              { id: 2, name: 'Player2' }
            ]
          }
        })
      })
      
      expect(result.current.gameState.gameId).toBe('game-456')
      expect(result.current.gameState.roomId).toBe('room-123')
      expect(result.current.gameState.jugadores).toHaveLength(2)
    })
    
    it('allows starting detective create set modal', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.gameDispatch({
          type: 'DETECTIVE_START_CREATE_SET'
        })
      })
      
      expect(result.current.gameState.detectiveAction.showCreateSet).toBe(true)
    })
    
    it('allows submitting detective set', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.gameDispatch({
          type: 'DETECTIVE_SET_SUBMITTED',
          payload: {
            actionId: 'action-123',
            setType: 'murder_weapon',
            stage: 1,
            cards: ['card-1', 'card-2'],
            hasWildcard: false,
            allowedPlayers: ['user-1', 'user-2'],
            secretsPool: 'revealed'
          }
        })
      })
      
      expect(result.current.gameState.detectiveAction.current).toEqual({
        actionId: 'action-123',
        setType: 'murder_weapon',
        stage: 1,
        cards: ['card-1', 'card-2'],
        hasWildcard: false
      })
      expect(result.current.gameState.detectiveAction.showSelectPlayer).toBe(true)
    })
  })

  describe('Disconnect Functionality', () => {
    it('disconnects from socket', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      act(() => {
        result.current.connectToGame('room-123', 'user-456')
      })
      
      act(() => {
        result.current.disconnectFromGame()
      })
      
      expect(mockSocket.disconnect).toHaveBeenCalled()
      expect(result.current.gameState.connected).toBe(false)
    })
    
    it('handles disconnect when no socket exists', () => {
      const { result } = renderHook(() => useGame(), {
        wrapper: GameProvider
      })
      
      // Should not throw error
      expect(() => {
        act(() => {
          result.current.disconnectFromGame()
        })
      }).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('throws error when useGame is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()
      
      expect(() => {
        renderHook(() => useGame())
      }).toThrow('useGame must be used within a GameProvider')
      
      console.error = originalError
    })
  })
})