// __tests__/SocketIOAndContext.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { GameProvider, useGame } from '../context/GameContext.jsx';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  id: 'mock-socket-id'
};

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket)
}));

// Test component that uses the GameContext
const TestComponent = () => {
  const { gameState, gameDispatch, connectToGame, disconnectFromGame } = useGame();
  
  return (
    <div>
      <div data-testid="connected">{gameState.connected ? 'connected' : 'disconnected'}</div>
      <div data-testid="game-id">{gameState.gameId || 'no-game'}</div>
      <div data-testid="current-turn">{gameState.turnoActual || 'no-turn'}</div>
      <div data-testid="players-count">{gameState.jugadores.length}</div>
      <div data-testid="hand-size">{gameState.mano.length}</div>
      <div data-testid="secrets-size">{gameState.secretos.length}</div>
      <div data-testid="game-ended">{gameState.gameEnded ? 'ended' : 'playing'}</div>
      <div data-testid="win-status">{gameState.ganaste === null ? 'unknown' : (gameState.ganaste ? 'won' : 'lost')}</div>
      <div data-testid="joined-room">{gameState.joinedRoom ? 'joined' : 'not-joined'}</div>
      <div data-testid="backend-connected">{gameState.backendConnected ? 'backend-connected' : 'backend-not-connected'}</div>
      
      <button 
        onClick={() => gameDispatch({ type: 'RESET_GAME' })}
        data-testid="reset-button"
      >
        Reset
      </button>
      
      <button 
        onClick={() => connectToGame(123, 456)}
        data-testid="connect-button"
      >
        Connect to Game
      </button>
      
      <button 
        onClick={() => disconnectFromGame()}
        data-testid="disconnect-button"
      >
        Disconnect
      </button>
    </div>
  );
};

describe('GameContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('game-id')).toHaveTextContent('no-game');
    expect(screen.getByTestId('current-turn')).toHaveTextContent('no-turn');
    expect(screen.getByTestId('players-count')).toHaveTextContent('0');
    expect(screen.getByTestId('hand-size')).toHaveTextContent('0');
    expect(screen.getByTestId('secrets-size')).toHaveTextContent('0');
    expect(screen.getByTestId('game-ended')).toHaveTextContent('playing');
    expect(screen.getByTestId('win-status')).toHaveTextContent('unknown');
    expect(screen.getByTestId('joined-room')).toHaveTextContent('not-joined');
    expect(screen.getByTestId('backend-connected')).toHaveTextContent('backend-not-connected');
  });

  it('should handle manual connection to game', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Initially no socket event listeners should be registered
    expect(mockSocket.on).not.toHaveBeenCalled();

    // Click connect button to trigger socket connection
    const connectButton = screen.getByTestId('connect-button');
    
    act(() => {
      connectButton.click();
    });

    // Now socket should be created and event listeners registered
    expect(mockSocket.on).toHaveBeenCalled();
    
    // Find and trigger the connect handler
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    expect(connectHandler).toBeDefined();
    
    act(() => {
      connectHandler();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('connected');
    });
  });

  it('should handle socket disconnection', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Get connect handler and trigger it
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    act(() => {
      connectHandler();
    });

    // Get disconnect handler and trigger it
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')?.[1];
    expect(disconnectHandler).toBeDefined();
    
    act(() => {
      disconnectHandler('client namespace disconnect');
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
    });
  });

  it('should handle backend connected event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect to game
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Find and trigger connected event from backend
    const connectedHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connected')?.[1];
    expect(connectedHandler).toBeDefined();

    const mockConnectedData = {
      message: 'Conectado exitosamente',
      user_id: 456,
      game_id: 123,
      sid: 'mock-socket-id'
    };

    act(() => {
      connectedHandler(mockConnectedData);
    });

    await waitFor(() => {
      expect(screen.getByTestId('joined-room')).toHaveTextContent('joined');
    });
  });

  it('should handle game_state_public event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameStatePublic = {
      game_id: 'test-game-123',
      turno_actual: 'player1',
      jugadores: [
        { user_id: 'player1', nombre: 'Player 1' },
        { user_id: 'player2', nombre: 'Player 2' }
      ],
      mazos: { deck1: ['card1', 'card2'] },
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const gameStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_public')?.[1];
    expect(gameStateHandler).toBeDefined();
    
    act(() => {
      gameStateHandler(mockGameStatePublic);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-id')).toHaveTextContent('test-game-123');
      expect(screen.getByTestId('current-turn')).toHaveTextContent('player1');
      expect(screen.getByTestId('players-count')).toHaveTextContent('2');
    });
  });

  it('should handle game_state_private event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameStatePrivate = {
      user_id: 'player1',
      mano: ['card1', 'card2', 'card3'],
      secretos: ['secret1'],
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const privateStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_private')?.[1];
    expect(privateStateHandler).toBeDefined();
    
    act(() => {
      privateStateHandler(mockGameStatePrivate);
    });

    await waitFor(() => {
      expect(screen.getByTestId('hand-size')).toHaveTextContent('3');
      expect(screen.getByTestId('secrets-size')).toHaveTextContent('1');
    });
  });

  it('should handle player_action_result (game ended) event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameEndResult = {
      type: 'game_ended',
      user_id: 'player1',
      ganaste: true,
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const actionResultHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player_action_result')?.[1];
    expect(actionResultHandler).toBeDefined();
    
    act(() => {
      actionResultHandler(mockGameEndResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-ended')).toHaveTextContent('ended');
      expect(screen.getByTestId('win-status')).toHaveTextContent('won');
    });
  });

  it('should handle losing game result', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameEndResult = {
      type: 'game_ended',
      user_id: 'player1',
      ganaste: false,
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const actionResultHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player_action_result')?.[1];
    expect(actionResultHandler).toBeDefined();
    
    act(() => {
      actionResultHandler(mockGameEndResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-ended')).toHaveTextContent('ended');
      expect(screen.getByTestId('win-status')).toHaveTextContent('lost');
    });
  });

  it('should handle game reset', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect and set some game state first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    const mockGameStatePublic = {
      game_id: 'test-game-123',
      turno_actual: 'player1',
      jugadores: [{ user_id: 'player1', nombre: 'Player 1' }],
      mazos: {},
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const gameStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_public')?.[1];
    act(() => {
      gameStateHandler(mockGameStatePublic);
    });

    // Verify game state is set
    await waitFor(() => {
      expect(screen.getByTestId('game-id')).toHaveTextContent('test-game-123');
    });

    // Reset the game
    const resetButton = screen.getByTestId('reset-button');
    act(() => {
      resetButton.click();
    });

    // Verify game state is reset
    await waitFor(() => {
      expect(screen.getByTestId('game-id')).toHaveTextContent('no-game');
      expect(screen.getByTestId('current-turn')).toHaveTextContent('no-turn');
      expect(screen.getByTestId('players-count')).toHaveTextContent('0');
      expect(screen.getByTestId('game-ended')).toHaveTextContent('playing');
    });
  });

  it('should setup all socket event listeners after connection', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Initially no listeners
    expect(mockSocket.on).not.toHaveBeenCalled();

    // Connect to game
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    // Verify all expected event listeners are registered after connection
    const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
    expect(eventNames).toContain('connect');
    expect(eventNames).toContain('disconnect');
    expect(eventNames).toContain('connected');
    expect(eventNames).toContain('game_state_public');
    expect(eventNames).toContain('game_state_private');
    expect(eventNames).toContain('player_action_result');
    expect(eventNames).toContain('connect_error');
  });

  it('should handle manual disconnection', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Connect first
    const connectButton = screen.getByTestId('connect-button');
    act(() => {
      connectButton.click();
    });

    expect(mockSocket.disconnect).not.toHaveBeenCalled();

    // Manually disconnect
    const disconnectButton = screen.getByTestId('disconnect-button');
    act(() => {
      disconnectButton.click();
    });

    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  it('should not create socket connection on mount', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Socket should not be created on mount - only when connectToGame is called
    expect(mockSocket.on).not.toHaveBeenCalled();
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
  });

  it('should throw error when useGame is used outside GameProvider', () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useGame must be used within a GameProvider');

    consoleSpy.mockRestore();
  });

  it('should handle multiple connections properly', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    const connectButton = screen.getByTestId('connect-button');
    
    // First connection
    act(() => {
      connectButton.click();
    });
    
    const firstCallCount = mockSocket.on.mock.calls.length;
    expect(firstCallCount).toBeGreaterThan(0);
    
    // Second connection should disconnect first and create new one
    act(() => {
      connectButton.click();
    });
    
    // Should have called disconnect once for cleanup
    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
    
    // Should have more socket.on calls for the new connection
    expect(mockSocket.on.mock.calls.length).toBeGreaterThan(firstCallCount);
  });
});