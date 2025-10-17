import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectPlayerModal from '../components/modals/SelectPlayer';

// Mock de los componentes con rutas correctas
vi.mock('../components/ProfileCard', () => ({
  default: ({ name, avatar, birthdate }) => (
    <div data-testid="profile-card">
      <div>{name}</div>
      <div>{avatar}</div>
      <div>{birthdate}</div>
    </div>
  )
}));

vi.mock('../components/Button', () => ({
  default: ({ onClick, title, disabled, children }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-testid={`button-${title?.toLowerCase()}`}
    >
      {children}
    </button>
  )
}));

describe('SelectPlayerModal', () => {
  const mockJugadores = [
    { id: '1', name: 'Jugador 1', avatar: 'avatar1.png', birthdate: '1990-01-01' },
    { id: '2', name: 'Jugador 2', avatar: 'avatar2.png', birthdate: '1991-02-02' },
    { id: '3', name: 'Jugador 3', avatar: 'avatar3.png', birthdate: '1992-03-03' }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    jugadores: mockJugadores,
    userId: '1',
    currentEventType: null,
    detectiveType: null,
    anotherVictim: null,
    detectiveAction: null,
    onPlayerSelect: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <SelectPlayerModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  describe('Another Victim Event', () => {
    it('muestra mensaje para seleccionar jugador cuando no hay selección', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
        />
      );
      expect(screen.getByText('Selecciona un jugador para robar su set de detective')).toBeInTheDocument();
    });

    it('muestra mensaje con jugador seleccionado', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
          anotherVictim={{ selectedPlayer: mockJugadores[1] }}
        />
      );
      expect(screen.getByText('Robar set de detective de Jugador 2')).toBeInTheDocument();
    });

    it('permite seleccionar un jugador', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
        />
      );
      const cards = screen.getAllByTestId('profile-card');
      // Los jugadores mostrados son mockJugadores[1] y mockJugadores[2] (excluye userId '1')
      fireEvent.click(cards[0].parentElement);
      expect(defaultProps.onPlayerSelect).toHaveBeenCalledWith(mockJugadores[1]);
    });

    it('habilita botón confirmar solo cuando hay jugador seleccionado', () => {
      const { rerender } = render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
        />
      );
      expect(screen.getByTestId('button-confirmar')).toBeDisabled();

      rerender(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
          anotherVictim={{ selectedPlayer: mockJugadores[1] }}
        />
      );
      expect(screen.getByTestId('button-confirmar')).not.toBeDisabled();
    });
  });

  describe('Detective Tipo A (marple, pyne, poirot)', () => {
    ['marple', 'pyne', 'poirot'].forEach(detective => {
      describe(`Detective ${detective}`, () => {
        it('muestra mensaje para seleccionar jugador', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
            />
          );
          expect(screen.getByText('Selecciona un jugador para robar su secreto')).toBeInTheDocument();
        });

        it('muestra mensaje con jugador seleccionado', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{ selectedPlayer: mockJugadores[1] }}
            />
          );
          expect(screen.getByText('Robar secreto de Jugador 2')).toBeInTheDocument();
        });

        it('filtra correctamente los jugadores a mostrar', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
            />
          );
          const cards = screen.getAllByTestId('profile-card');
          expect(cards).toHaveLength(2); // No incluye al usuario actual
        });

        it('habilita confirmar cuando hay selección', () => {
          const { rerender } = render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
            />
          );
          expect(screen.getByTestId('button-confirmar')).toBeDisabled();

          rerender(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{ selectedPlayer: mockJugadores[1] }}
            />
          );
          expect(screen.getByTestId('button-confirmar')).not.toBeDisabled();
        });
      });
    });
  });

  describe('Detective Tipo B (beresford, satterthwaite)', () => {
    ['beresford', 'satterthwaite'].forEach(detective => {
      describe(`Detective ${detective}`, () => {
        it('muestra mensaje correcto cuando el usuario es el iniciador', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { initiatorPlayerId: '1' }
              }}
            />
          );
          expect(screen.getByText('Selecciona un jugador objetivo')).toBeInTheDocument();
        });

        it('muestra jugador seleccionado cuando es iniciador', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { initiatorPlayerId: '1' },
                selectedPlayer: mockJugadores[1]
              }}
            />
          );
          expect(screen.getByText('Jugador seleccionado: Jugador 2')).toBeInTheDocument();
        });

        it('muestra mensaje correcto cuando el usuario es el objetivo', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { 
                  initiatorPlayerId: '2',
                  targetPlayerId: '1'
                }
              }}
            />
          );
          expect(screen.getByText(/Has sido seleccionado por Jugador 2/)).toBeInTheDocument();
        });

        it('no muestra lista de jugadores cuando es objetivo', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { 
                  initiatorPlayerId: '2',
                  targetPlayerId: '1'
                }
              }}
            />
          );
          expect(screen.queryAllByTestId('profile-card')).toHaveLength(0);
        });

        it('objetivo puede confirmar sin selección', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { 
                  initiatorPlayerId: '2',
                  targetPlayerId: '1'
                }
              }}
            />
          );
          expect(screen.getByTestId('button-confirmar')).not.toBeDisabled();
        });

        it('muestra lista de jugadores cuando el usuario es el iniciador', () => {
          render(
            <SelectPlayerModal
              {...defaultProps}
              detectiveType={detective}
              detectiveAction={{
                actionInProgress: { initiatorPlayerId: '1' }
              }}
            />
          );
          
          const cards = screen.getAllByTestId('profile-card');
          // Excluye userId '1', quedan jugadores '2' y '3'
          expect(cards).toHaveLength(2);
        });
      });
    });
  });

  describe('Interacciones de botones', () => {
    it('llama a onConfirm cuando se hace clic en confirmar', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
          anotherVictim={{ selectedPlayer: mockJugadores[1] }}
        />
      );
      const confirmButton = screen.getByText('Confirmar');
      fireEvent.click(confirmButton);
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('llama a onCancel cuando se hace clic en cancelar', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
        />
      );
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Resaltado de selección', () => {
    it('resalta el jugador seleccionado en another_victim', () => {
      const { container } = render(
        <SelectPlayerModal
          {...defaultProps}
          currentEventType="another_victim"
          anotherVictim={{ selectedPlayer: { ...mockJugadores[1], id: '2' } }}
        />
      );
      const highlighted = container.querySelector('.ring-4.ring-\\[\\#FFD700\\]');
      expect(highlighted).toBeInTheDocument();
    });

    it('resalta el jugador seleccionado en detective action', () => {
      const { container } = render(
        <SelectPlayerModal
          {...defaultProps}
          detectiveType="marple"
          detectiveAction={{ selectedPlayer: { ...mockJugadores[1], id: '2' } }}
        />
      );
      const highlighted = container.querySelector('.ring-4.ring-\\[\\#FFD700\\]');
      expect(highlighted).toBeInTheDocument();
    });
  });

  describe('Casos edge', () => {
    it('maneja jugadores sin nombre del iniciador correctamente', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          detectiveType="beresford"
          detectiveAction={{
            actionInProgress: { 
              initiatorPlayerId: '999',
              targetPlayerId: '1'
            }
          }}
        />
      );
      expect(screen.getByText(/Has sido seleccionado por un jugador/)).toBeInTheDocument();
    });

    it('maneja lista de jugadores vacía', () => {
      render(
        <SelectPlayerModal
          {...defaultProps}
          jugadores={[{ id: '1', name: 'Solo User', avatar: 'av.png', birthdate: '1990-01-01' }]}
          currentEventType="another_victim"
        />
      );
      expect(screen.queryAllByTestId('profile-card')).toHaveLength(0);
    });

    it('maneja detectiveType desconocido', () => {
      const { container } = render(
        <SelectPlayerModal
          {...defaultProps}
          detectiveType="unknown_detective"
        />
      );
      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('');
    });
  });
});