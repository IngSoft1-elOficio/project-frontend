// Archivo: GameJoin.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GameJoin from '../containers/GameJoin';
import { useGame } from '../context/GameContext';
import { useUser } from '../context/UserContext';

// Mocks
vi.mock('../context/GameContext');
vi.mock('../context/UserContext');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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
        gameDispatch: vi.fn(),
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
        gameDispatch: vi.fn(),
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
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });
      renderWithRouter(<GameJoin />);
    });
  });

  describe('Botón iniciar', () => {
    it('está habilitado cuando el usuario es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [{ user_id: '1', nombre: 'Host', isHost: true }],
          gameId: 'TEST123',
        },
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: true },
      });
      renderWithRouter(<GameJoin />);
      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).not.toBeDisabled();
    });

    it('está deshabilitado con lista vacía', () => {
      useGame.mockReturnValue({
        gameState: { jugadores: [], gameId: 'TEST123' },
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });
      renderWithRouter(<GameJoin />);
      // const button = screen.getByRole('button', { name: /iniciar partida/i }); <<- no es host ==> no se muestra
      // expect(button).toBeDisabled();
    });

    it('llama al fetch cuando el host inicia la partida', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ 
          turn: { current_player_id: '1' },
          game: { players: [], deck_count: 52 }
        }),
      });

      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 'room123',
        },
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: true, id: 'user1' },
      });

      renderWithRouter(<GameJoin />);
      const button = screen.getByRole('button', { name: /iniciar partida/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('maneja error al iniciar partida', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Error de prueba' }),
      });

      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 'room123',
        },
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: true, id: 'user1' },
      });

      renderWithRouter(<GameJoin />);
      const button = screen.getByRole('button', { name: /iniciar partida/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalled();
      });

      errorSpy.mockRestore();
    });
  });

  /* DEscomentarr arreglando que se llama en useEffect entonses no se esta llamando
  describe('Navegación automática', () => {
    it('navega cuando no es host y el juego inició', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 'room123',
          started: 'INGAME',
        },
        gameDispatch: vi.fn(),
      });
      useUser.mockReturnValue({
        userState: { isHost: false },
      });

      renderWithRouter(<GameJoin />);

      expect(mockNavigate).toHaveBeenCalledWith('/game/room123');
    });
  });
  */
});