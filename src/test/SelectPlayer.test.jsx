import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../src/context/UserContext.jsx', () => ({
  useUser: vi.fn()
}));

vi.mock('../../src/context/GameContext.jsx', () => ({
  useGame: vi.fn()
}));

// Mock de los componentes
vi.mock('../../src/components/ProfileCard', () => ({
  default: ({ name, avatar, birthdate }) => (
    <div data-testid="profile-card">
      <div data-testid="player-name">{name}</div>
      <div data-testid="player-avatar">{avatar}</div>
      <div data-testid="player-birthdate">{birthdate}</div>
    </div>
  )
}));

vi.mock('../../src/components/Button', () => ({
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

// AHORA sí importamos el componente
import SelectPlayerModal from '../../src/components/modals/SelectPlayer';
import { useUser } from '../../src/context/UserContext.jsx';
import { useGame } from '../../src/context/GameContext.jsx';

// Mock data
const mockUserState = {
  id: '1'
};

const mockGameState = {
  jugadores: [
    { player_id: '1', name: 'Jugador 1', avatar: 'avatar1.png', birthdate: '1990-01-01' },
    { player_id: '2', name: 'Jugador 2', avatar: 'avatar2.png', birthdate: '1991-02-02' },
    { player_id: '3', name: 'Jugador 3', avatar: 'avatar3.png', birthdate: '1992-03-03' }
  ]
};

describe('SelectPlayerModal', () => {
  const mockOnPlayerSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar los mocks antes de cada test
    mockUserState.id = '1';
    mockGameState.jugadores = [
      { player_id: '1', name: 'Jugador 1', avatar: 'avatar1.png', birthdate: '1990-01-01' },
      { player_id: '2', name: 'Jugador 2', avatar: 'avatar2.png', birthdate: '1991-02-02' },
      { player_id: '3', name: 'Jugador 3', avatar: 'avatar3.png', birthdate: '1992-03-03' }
    ];

    // Implementar los mocks
    useUser.mockReturnValue({
      userState: mockUserState
    });

    useGame.mockReturnValue({
      gameState: mockGameState
    });
  });

  describe('Renderizado básico', () => {
    it('renderiza el modal correctamente', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Selecciona un jugador')).toBeInTheDocument();
      expect(screen.getByTestId('button-confirmar')).toBeInTheDocument();
    });

    it('aplica las clases CSS correctas al contenedor principal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalLayout = container.firstChild;
      expect(modalLayout).toHaveClass('fixed', 'inset-0', 'flex', 'z-50');
    });

    it('aplica las clases correctas al contenedor del modal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.bg-\\[\\#1D0000\\]');
      expect(modalContainer).toHaveClass('border-4', 'border-[#825012]', 'rounded-2xl');
    });
  });

  describe('Lista de jugadores', () => {
    it('muestra todos los jugadores excepto el usuario actual', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      expect(cards).toHaveLength(2); // Jugadores 2 y 3
    });

    it('muestra los nombres correctos de los jugadores', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Jugador 2')).toBeInTheDocument();
      expect(screen.getByText('Jugador 3')).toBeInTheDocument();
      expect(screen.queryByText('Jugador 1')).not.toBeInTheDocument();
    });

    it('filtra correctamente al usuario actual', () => {
      mockUserState.id = '2';
      useUser.mockReturnValue({ userState: mockUserState });
      
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      expect(cards).toHaveLength(2); // Jugadores 1 y 3
      expect(screen.getByText('Jugador 1')).toBeInTheDocument();
      expect(screen.getByText('Jugador 3')).toBeInTheDocument();
      expect(screen.queryByText('Jugador 2')).not.toBeInTheDocument();
    });

    it('formatea correctamente las fechas de nacimiento', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const birthdates = screen.getAllByTestId('player-birthdate');
      expect(birthdates.length).toBeGreaterThan(0);
      
      // Verifica que cada fecha esté formateada
      birthdates.forEach(birthdate => {
        expect(birthdate.textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      });
    });

    it('usa grid layout para los jugadores', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-3');
    });
  });

  describe('Selección de jugador', () => {
    it('permite seleccionar un jugador al hacer click', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      const firstCard = cards[0];
      
      fireEvent.click(firstCard.parentElement);

      expect(firstCard.parentElement).toHaveClass('ring-4', 'ring-[#FFD700]');
    });

    it('cambia la selección al hacer click en otro jugador', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      const firstCard = cards[0].parentElement;
      const secondCard = cards[1].parentElement;

      fireEvent.click(firstCard);
      expect(firstCard).toHaveClass('ring-4', 'ring-[#FFD700]');

      fireEvent.click(secondCard);
      expect(secondCard).toHaveClass('ring-4', 'ring-[#FFD700]');
      expect(firstCard).not.toHaveClass('ring-4', 'ring-[#FFD700]');
    });

    it('aplica hover effect a las tarjetas', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      const firstCard = cards[0].parentElement;

      expect(firstCard).toHaveClass('hover:scale-105', 'transition-all');
    });

    it('aplica cursor pointer a las tarjetas', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      cards.forEach(card => {
        expect(card.parentElement).toHaveClass('cursor-pointer');
      });
    });

    it('solo un jugador puede estar seleccionado a la vez', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      
      fireEvent.click(cards[0].parentElement);
      fireEvent.click(cards[1].parentElement);

      const highlighted = screen.getAllByTestId('profile-card')
        .map(card => card.parentElement)
        .filter(el => el.className.includes('ring-4'));
      
      expect(highlighted).toHaveLength(1);
    });
  });

  describe('Botón de confirmación', () => {
    it('renderiza el botón de confirmar', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const confirmButton = screen.getByTestId('button-confirmar');
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).toHaveTextContent('Confirmar');
    });

    it('el botón de confirmar nunca está deshabilitado', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const confirmButton = screen.getByTestId('button-confirmar');
      expect(confirmButton).not.toBeDisabled();
    });

    it('no llama a onPlayerSelect si no hay jugador seleccionado', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const confirmButton = screen.getByTestId('button-confirmar');
      fireEvent.click(confirmButton);

      expect(mockOnPlayerSelect).not.toHaveBeenCalled();
    });

    it('llama a onPlayerSelect con el ID correcto cuando hay selección', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      fireEvent.click(cards[0].parentElement); // Selecciona jugador 2

      const confirmButton = screen.getByTestId('button-confirmar');
      fireEvent.click(confirmButton);

      expect(mockOnPlayerSelect).toHaveBeenCalledWith('2');
    });

    it('llama a onPlayerSelect con el ID del segundo jugador', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      fireEvent.click(cards[1].parentElement); // Selecciona jugador 3

      const confirmButton = screen.getByTestId('button-confirmar');
      fireEvent.click(confirmButton);

      expect(mockOnPlayerSelect).toHaveBeenCalledWith('3');
    });
  });

  describe('Casos edge', () => {
    it('maneja lista con solo el usuario actual', () => {
      mockGameState.jugadores = [
        { player_id: '1', name: 'Solo User', avatar: 'av.png', birthdate: '1990-01-01' }
      ];
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryAllByTestId('profile-card')).toHaveLength(0);
    });

    it('maneja lista vacía de jugadores', () => {
      mockGameState.jugadores = [];
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryAllByTestId('profile-card')).toHaveLength(0);
    });

    it('maneja muchos jugadores correctamente', () => {
      mockGameState.jugadores = Array.from({ length: 10 }, (_, i) => ({
        player_id: `${i + 1}`,
        name: `Jugador ${i + 1}`,
        avatar: `avatar${i + 1}.png`,
        birthdate: '1990-01-01'
      }));
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const cards = screen.getAllByTestId('profile-card');
      expect(cards).toHaveLength(9); // Todos excepto el usuario actual
    });

    it('maneja player_id como string correctamente', () => {
      mockUserState.id = '1';
      mockGameState.jugadores = [
        { player_id: '1', name: 'User', avatar: 'av.png', birthdate: '1990-01-01' },
        { player_id: '2', name: 'Player 2', avatar: 'av2.png', birthdate: '1990-01-01' }
      ];
      useUser.mockReturnValue({ userState: mockUserState });
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryByText('User')).not.toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('maneja player_id como número correctamente', () => {
      mockUserState.id = 1;
      mockGameState.jugadores = [
        { player_id: 1, name: 'User', avatar: 'av.png', birthdate: '1990-01-01' },
        { player_id: 2, name: 'Player 2', avatar: 'av2.png', birthdate: '1990-01-01' }
      ];
      useUser.mockReturnValue({ userState: mockUserState });
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.queryByText('User')).not.toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });

    it('maneja fechas inválidas sin romper', () => {
      mockGameState.jugadores = [
        { player_id: '2', name: 'Player 2', avatar: 'av.png', birthdate: 'invalid-date' }
      ];
      useGame.mockReturnValue({ gameState: mockGameState });

      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);
      
      // El componente debe renderizarse sin errores
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    it('maneja jugadores sin avatar correctamente', () => {
      mockGameState.jugadores = [
        { player_id: '2', name: 'Player 2', birthdate: '1990-01-01' }
      ];
      useGame.mockReturnValue({ gameState: mockGameState });

      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      expect(screen.getByText('Player 2')).toBeInTheDocument();
    });
  });

  describe('Estructura y estilos', () => {
    it('aplica el fondo oscuro con opacidad al overlay', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-60');
    });

    it('centra el contenido del modal', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('items-center', 'justify-center');
    });

    it('aplica el ancho máximo correcto al contenedor', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.max-w-3xl');
      expect(modalContainer).toBeInTheDocument();
    });

    it('usa flexbox con gap correcto', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const modalContainer = container.querySelector('.gap-6');
      expect(modalContainer).toBeInTheDocument();
    });

    it('aplica estilos correctos al mensaje de acción', () => {
      render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const heading = screen.getByText('Selecciona un jugador');
      expect(heading.parentElement).toHaveClass('text-[#FFE0B2]', 'text-xl', 'font-semibold');
    });

    it('usa key correcta para cada jugador', () => {
      const { container } = render(<SelectPlayerModal onPlayerSelect={mockOnPlayerSelect} />);

      const playerCards = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(playerCards.length).toBeGreaterThan(0);
    });
  });
});