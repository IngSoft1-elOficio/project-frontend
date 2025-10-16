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
      { owner_id: 1, set_type: 'A', count: 3 },
      { owner_id: 1, set_type: 'B', count: 2 },
      { owner_id: 2, set_type: 'C', count: 4 }
    ]

    it('renderiza los sets del jugador correcto', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Set 1')).toBeInTheDocument()
      expect(screen.getByText('Set 2')).toBeInTheDocument()
      expect(screen.queryByText('Set 3')).not.toBeInTheDocument()
    })

    it('muestra el conteo correcto de cartas', () => {
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={mockSets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('3 cartas')).toBeInTheDocument()
      expect(screen.getByText('2 cartas')).toBeInTheDocument()
    })

    it('usa singular "carta" cuando count es 1', () => {
      const singleCardSet = [{ owner_id: 1, set_type: 'A', count: 1 }]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={singleCardSet}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('1 carta')).toBeInTheDocument()
    })

    it('renderiza las mini-cartas visuales según el count', () => {
      const sets = [{ owner_id: 1, set_type: 'A', count: 3 }]
      
      const { container } = render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      const miniCards = container.querySelectorAll('.w-16.h-24')
      expect(miniCards).toHaveLength(3)
    })

    it('muestra el owner_id del set', () => {
      const sets = [{ owner_id: 1, set_type: 'A', count: 2 }]
      
      render(
        <SelectOtherPLayerSet
          player={mockPlayer}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.getByText('Dueño: Jugador #1')).toBeInTheDocument()
    })
  })

  describe('Interacciones', () => {

    it('recibe onSelectSet como función', () => {
      const sets = [{ owner_id: 1, set_type: 'A', count: 2 }]
      
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
    it('maneja sets con set_type undefined', () => {
      const setsWithoutType = [{ owner_id: 1, count: 2 }]
      
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
        { owner_id: 1, set_type: 'A', count: 2 },
        { owner_id: 2, set_type: 'B', count: 3 }
      ]

      render(
        <SelectOtherPLayerSet
          player={playerWithoutSets}
          sets={sets}
          onSelectSet={mockOnSelectSet}
        />
      )

      expect(screen.queryByText('Set 1')).not.toBeInTheDocument()
    })

    it('maneja múltiples sets del mismo jugador', () => {
      const manySets = Array.from({ length: 5 }, (_, i) => ({
        owner_id: 1,
        set_type: `Type${i}`,
        count: i + 1
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
  })
})