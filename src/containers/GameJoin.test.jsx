// Archivo: GameJoin.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GameJoin from './GameJoin';
import { useAppContext } from '../context/AppContext';

// Mocks
vi.mock('../context/AppContext');
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
    it('muestra el título y game_id', () => {
      useAppContext.mockReturnValue({
        usuarios: [],
        game_id: 'TEST123',
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Partida:')).toBeInTheDocument();
      expect(screen.getByText('TEST123')).toBeInTheDocument();
      expect(screen.getByText('Jugadores')).toBeInTheDocument();
    });

    it('muestra "Sin nombre" cuando no hay game_id', () => {
      useAppContext.mockReturnValue({
        usuarios: [],
        game_id: '',
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Sin nombre')).toBeInTheDocument();
    });

    it('muestra la lista de usuarios', () => {
      useAppContext.mockReturnValue({
        usuarios: [
          { user_id: '1', nombre: 'Player1', host: true },
          { user_id: '2', nombre: 'Player2', host: false },
        ],
        game_id: 'TEST123',
      });

      renderWithRouter(<GameJoin />);

      expect(screen.getByText('Player1')).toBeInTheDocument();
      expect(screen.getByText('Player2')).toBeInTheDocument();
    });
  });

  describe('Botón iniciar', () => {
    it('está habilitado cuando hay host', () => {
      useAppContext.mockReturnValue({
        usuarios: [{ user_id: '1', nombre: 'Host', host: true }],
        game_id: 'TEST123',
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).not.toBeDisabled();
    });

    it('está deshabilitado cuando no hay host', () => {
      useAppContext.mockReturnValue({
        usuarios: [{ user_id: '1', nombre: 'Player', host: false }],
        game_id: 'TEST123',
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).toBeDisabled();
    });

    it('está deshabilitado con lista vacía', () => {
      useAppContext.mockReturnValue({
        usuarios: [],
        game_id: 'TEST123',
      });

      renderWithRouter(<GameJoin />);

      const button = screen.getByRole('button', { name: /iniciar partida/i });
      expect(button).toBeDisabled();
    });

    it('hace la llamada a la API al hacer click', () => {
      useAppContext.mockReturnValue({
        usuarios: [{ user_id: '26', nombre: 'Host', host: true }],
        game_id: 'TEST123',
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

