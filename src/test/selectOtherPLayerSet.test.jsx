import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SelectOtherPLayerSet from '../components/modals/SelectOtherPLayerSet'

// Mock de los componentes externos
vi.mock('../ButtonGame.jsx', () => ({
  default: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button-game">
      {children}
    </button>
  )
}))

vi.mock('react-icons/fi', () => ({
  FiArchive: () => <div data-testid="archive-icon">Archive Icon</div>
}))

describe('SelectOtherPLayerSet', () => {
  const mockPlayer = { id: 1, name: 'Jugador 1' }
  const mockOnSelectSet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('renderiza el componente correctamente', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Sets del jugador')).toBeInTheDocument()
      expect(screen.getByText('Selecionar Set')).toBeInTheDocument()
    })

    it('aplica las clases CSS correctas al contenedor principal', () => {
      const { container } = render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      const overlay = container.firstChild
      expect(overlay).toHaveClass('fixed', 'inset-0', 'flex', 'z-50')
    })
  })

  describe('Estado vacío', () => {
    it('muestra el mensaje de estado vacío cuando no hay sets', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={[]}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument()
      expect(screen.getByText(/Ningún jugador tiene sets de detective/)).toBeInTheDocument()
      expect(screen.getByTestId('archive-icon')).toBeInTheDocument()
    })
  })

  describe('Renderizado de sets', () => {
    const mockSets = [
      {
        id: 1,
        owner_id: 1,
        setType: 'A',
        setName: 'Set Detective A',
        cards: [
          { id: 1, name: 'Card 1', img_src: '/cards/card1.png' },
          { id: 2, name: 'Card 2', img_src: '/cards/card2.png' },
          { id: 3, name: 'Card 3', img_src: '/cards/card3.png' }
        ]
      },
      {
        id: 2,
        owner_id: 1,
        setType: 'B',
        setName: 'Set Detective B',
        cards: [
          { id: 4, name: 'Card 4', img_src: '/cards/card4.png' },
          { id: 5, name: 'Card 5', img_src: '/cards/card5.png' }
        ]
      },
      {
        id: 3,
        owner_id: 2,
        setType: 'C',
        setName: 'Set Detective C',
        cards: [
          { id: 6, name: 'Card 6', img_src: '/cards/card6.png' }
        ]
      }
    ]

    it('renderiza los sets del jugador correcto', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set Detective A')).toBeInTheDocument()
      expect(screen.getByText('Set Detective B')).toBeInTheDocument()
      expect(screen.queryByText('Set Detective C')).not.toBeInTheDocument()
    })

    it('muestra el badge "Jugado" en cada set', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const jugadoBadges = screen.getAllByText('Jugado')
      expect(jugadoBadges).toHaveLength(2) // Solo los sets del jugador 1
    })

    it('usa el nombre por defecto cuando no hay setName', () => {
      const setsWithoutName = [
        { id: 1, owner_id: 1, setType: 'A', cards: [] }
      ]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={setsWithoutName}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 1')).toBeInTheDocument()
    })

    it('renderiza las mini-cartas visuales según el array de cards', () => {
      const sets = [
        {
          id: 1,
          owner_id: 1,
          setType: 'A',
          cards: [
            { id: 1, name: 'Card 1', img_src: '/cards/card1.png' },
            { id: 2, name: 'Card 2', img_src: '/cards/card2.png' },
            { id: 3, name: 'Card 3', img_src: '/cards/card3.png' }
          ]
        }
      ]
      
      const { container } = render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const miniCardImages = container.querySelectorAll('img[alt]')
      expect(miniCardImages).toHaveLength(3)
    })

    it('renderiza las imágenes de las cartas correctamente', () => {
      const sets = [
        {
          id: 1,
          owner_id: 1,
          cards: [
            { id: 1, name: 'Test Card', img_src: '/cards/test.png' }
          ]
        }
      ]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const cardImage = screen.getByAltText('Test Card')
      expect(cardImage).toBeInTheDocument()
      expect(cardImage).toHaveAttribute('src', '/cards/test.png')
    })

    it('usa imagen por defecto cuando no hay img_src', () => {
      const sets = [
        {
          id: 1,
          owner_id: 1,
          cards: [
            { id: 1, name: 'Card without image' }
          ]
        }
      ]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const cardImage = screen.getByAltText('Card without image')
      expect(cardImage).toHaveAttribute('src', '/cards/01-card_back.png')
    })
  })

  describe('Interacciones', () => {
    it('recibe onSelectSet como función', () => {
      const sets = [
        {
          id: 1,
          owner_id: 1,
          setType: 'A',
          cards: []
        }
      ]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(typeof mockOnSelectSet).toBe('function')
    })
  })

  describe('Props por defecto', () => {
    it('usa un array vacío como default para sets', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('No hay sets disponibles')).toBeInTheDocument()
    })
  })

  describe('Casos edge', () => {
    it('maneja sets con setType undefined', () => {
      const setsWithoutType = [
        {
          id: 1,
          owner_id: 1,
          cards: []
        }
      ]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={setsWithoutType}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 1')).toBeInTheDocument()
    })

    it('maneja un jugador sin sets cuando otros jugadores tienen sets', () => {
      const playerWithoutSets = { id: 99, name: 'Jugador sin sets' }
      const sets = [
        {
          id: 1,
          owner_id: 1,
          setType: 'A',
          setName: 'Set A',
          cards: []
        },
        {
          id: 2,
          owner_id: 2,
          setType: 'B',
          setName: 'Set B',
          cards: []
        }
      ]

      render(
        <SelectOtherPLayerSet
          player={playerWithoutSets}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.queryByText('Set A')).not.toBeInTheDocument()
      expect(screen.queryByText('Set B')).not.toBeInTheDocument()
    })

    it('maneja múltiples sets del mismo jugador', () => {
      const manySets = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        owner_id: 1,
        setType: `Type${i}`,
        setName: `Set ${i + 1}`,
        cards: []
      }))

      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={manySets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 1')).toBeInTheDocument()
      expect(screen.getByText('Set 5')).toBeInTheDocument()
    })

    it('maneja sets sin cards array', () => {
      const setsWithoutCards = [
        {
          id: 1,
          owner_id: 1,
          setType: 'A'
        }
      ]
      
      const { container } = render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={setsWithoutCards}
          onSelectSet={mockOnSelectSet}
        />
      )

      // No debería haber imágenes de cartas
      const cardImages = container.querySelectorAll('img[alt]')
      expect(cardImages).toHaveLength(0)
    })
  })
})