// Archivo: GameJoin.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GameJoin from '../containers/GameJoin';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';

// Mocks
vi.mock('../context/GameContext');
vi.mock('../context/UserContext');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
global.fetch = vi.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GameJoin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Render básico', () => {
    it('muestra el título y gameId', () => {
      useGame.mockReturnValue({
        gameState: { jugadores: [], gameId: 'TEST123' },
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Partida:')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
      expect(screen.getByText('Jugadores')).toBeInTheDocument();
    });

    it('muestra "Sin nombre" cuando no hay gameId', () => {
      useGame.mockReturnValue({
        gameState: { jugadores: [], gameId: '' },
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Sin nombre')).toBeInTheDocument();
    });

    it('muestra la lista de jugadores', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [
            { user_id: '1', nombre: 'Player1', isHost: true },
            { user_id: '2', nombre: 'Player2', isHost: false },
          ],
          gameId: 'TEST123',
        },
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Player1')).toBeInTheDocument();
      expect(screen.getByText('Player2')).toBeInTheDocument();
    });
  });

  describe('Botón iniciar', () => {
    it('está habilitado cuando el usuario es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [{ user_id: '1', nombre: 'Host', isHost: true }],
          gameId: 'TEST123',
        },
      });
      useUser.mockReturnValue({
        userState: { isHost: true },
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).not.toBeDisabled();
    });

    it('está deshabilitado cuando el usuario no es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [{ user_id: '1', nombre: 'Player', isHost: false }],
          gameId: 'TEST123',
        },
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).toBeDisabled();
    });

    it('está deshabilitado con lista vacía', () => {
      useGame.mockReturnValue({
        gameState: { jugadores: [], gameId: 'TEST123' },
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).toBeDisabled();
    });

    it('hace la llamada a la API al hacer click', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [{ user_id: '26', nombre: 'Host', isHost: true }],
          gameId: 'TEST123',
        },
      });
      useUser.mockReturnValue({
        userState: { isHost: true },
      });
      fetch.mockResolvedValueOnce({ ok: true });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      fireEvent.click(button);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/game/TEST123/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: '26' }),
        }
      );
    });
  });
});
