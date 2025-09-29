import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import Secrets from '../components/Secrets';
import * as GameContext from '../context/GameContext';

// Mockeamos el hook como función para poder cambiar su retorno en cada test
vi.mock('../context/GameContext', () => ({
  useGame: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('Secrets', () => {
  it('renderiza todos los secretos cuando hay secretos disponibles', () => {
    // configurar mock para este caso
    GameContext.useGame.mockReturnValue({
      gameState: {
        secretos: [
          { id: 1, player_id: 1, name: "You're the murderer" },
          { id: 2, player_id: 1, name: "You're the accomplice" },
          { id: 3, player_id: 1, name: "Other secret" },
        ],
      },
    });

    render(<Secrets />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('no renderiza nada cuando no hay secretos', () => {
    // reconfigurar mock para este test: retorno sin secretos
    GameContext.useGame.mockReturnValue({ gameState: { secretos: [] } });

    render(<Secrets />);
    const secretButtons = screen.queryAllByRole('button');
    expect(secretButtons).toHaveLength(0);
  });

  it('hover cambia imagen (murderer -> back/front)', () => {
    GameContext.useGame.mockReturnValue({
      gameState: {
        secretos: [
          { id: 1, player_id: 1, name: "You're the murderer" },
        ],
      },
    });

    render(<Secrets />);
    const btn = screen.getByRole('button');
    const img = screen.getByRole('img');

    // front inicial
    expect(img.src).toContain('secret_front.png');

    fireEvent.mouseEnter(btn);
    expect(img.src).toContain('secret_murderer.png');

    fireEvent.mouseLeave(btn);
    expect(img.src).toContain('secret_front.png');
  });
});
