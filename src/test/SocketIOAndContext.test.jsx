// __tests__/GameContext.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { GameProvider, useGame } from '../context/GameContext.jsx';

// Mock socket.io-client
const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn()
};

vi.mock('socket.io-client', () => ({
  default: vi.fn(() => mockSocket)
}));

// Test component that uses the GameContext
const TestComponent = () => {
  const { gameState, gameDispatch } = useGame();
  
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
      <button 
        onClick={() => gameDispatch({ type: 'RESET_GAME' })}
        data-testid="reset-button"
      >
        Reset
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
  });

  it('should handle socket connection', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Simulate socket connect event
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    
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

    // First connect
    const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    act(() => {
      connectHandler();
    });

    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    act(() => {
      disconnectHandler();
    });

    await waitFor(() => {
      expect(screen.getByTestId('connected')).toHaveTextContent('disconnected');
    });
  });

  it('should handle game_state_public event', async () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

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

    const gameStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_public')[1];
    
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

    const mockGameStatePrivate = {
      user_id: 'player1',
      mano: ['card1', 'card2', 'card3'],
      secretos: ['secret1'],
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const privateStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_private')[1];
    
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

    const mockGameEndResult = {
      type: 'game_ended',
      user_id: 'player1',
      ganaste: true,
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const actionResultHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player_action_result')[1];
    
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

    const mockGameEndResult = {
      type: 'game_ended',
      user_id: 'player1',
      ganaste: false,
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const actionResultHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player_action_result')[1];
    
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

    // First, set some game state
    const mockGameStatePublic = {
      game_id: 'test-game-123',
      turno_actual: 'player1',
      jugadores: [{ user_id: 'player1', nombre: 'Player 1' }],
      mazos: {},
      timestamp: '2023-01-01T00:00:00.000Z'
    };

    const gameStateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_state_public')[1];
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

  it('should setup all socket event listeners', () => {
    render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    // Verify all expected event listeners are registered
    const eventNames = mockSocket.on.mock.calls.map(call => call[0]);
    expect(eventNames).toContain('connect');
    expect(eventNames).toContain('disconnect');
    expect(eventNames).toContain('game_state_public');
    expect(eventNames).toContain('game_state_private');
    expect(eventNames).toContain('player_action_result');
  });

  it('should cleanup socket connection on unmount', () => {
    const { unmount } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(mockSocket.disconnect).not.toHaveBeenCalled();

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  it('should throw error when useGame is used outside GameProvider', () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useGame must be used within a GameProvider');

    consoleSpy.mockRestore();
  });
});