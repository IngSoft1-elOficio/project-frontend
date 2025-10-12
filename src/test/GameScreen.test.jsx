import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import GameScreen from '../containers/gameScreen/GameScreen'
import { useUser } from '../context/UserContext'
import { useGame } from '../context/GameContext'

// Mock context
vi.mock('../context/UserContext')
vi.mock('../context/GameContext')

// Mock components
vi.mock('../components/Deck', () => ({
  default: ({ cardsLeft, onClick, disabled }) => (
    <div data-testid="deck" onClick={disabled ? undefined : onClick}>
      Deck: {cardsLeft} cards
    </div>
  )
}))

vi.mock('../components/Discard', () => ({
  default: ({ topDiscardedCard, counterDiscarded }) => (
    <div data-testid="discard">
      Top: {topDiscardedCard}, Count: {counterDiscarded}
    </div>
  )
}))

vi.mock('../components/GameEndModal', () => ({
  default: ({ message }) => <div data-testid="game-end-modal">{message}</div>
}))

vi.mock('../components/HandCards', () => ({
  default: ({ selectedCards, onSelect }) => (
    <div data-testid="hand-cards">
      <button onClick={() => onSelect('card-1')}>Select Card 1</button>
      <button onClick={() => onSelect('card-2')}>Select Card 2</button>
      <div>Selected: {selectedCards.join(', ')}</div>
    </div>
  )
}))

vi.mock('../components/Secrets', () => ({
  default: () => <div data-testid="secrets">Secrets Component</div>
}))

vi.mock('../components/ButtonGame', () => ({
  default: ({ children, onClick, disabled }) => (
    <button data-testid={`button-${children.toLowerCase().replace(' ', '-')}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}))

describe('GameScreen Component', () => {
  let mockUserState
  let mockGameState
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Default mock states
    mockUserState = {
      id: 1,
      username: 'TestPlayer'
    }
    
    mockGameState = {
      gameId: 'game-123',
      roomId: 'room-456',
      turnoActual: 2, // Not player's turn by default
      mazos: {
        deck: { count: 10, draft: [] },
        discard: { top: 'card-top', count: 5 }
      },
      gameEnded: false
    }
    
    // Setup context mocks
    useUser.mockReturnValue({ userState: mockUserState })
    useGame.mockReturnValue({ gameState: mockGameState })
    
    // Mock fetch globally
    global.fetch = vi.fn()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders all main components', () => {
      render(<GameScreen />)
      
      expect(screen.getByTestId('secrets')).toBeInTheDocument()
      expect(screen.getByTestId('deck')).toBeInTheDocument()
      expect(screen.getByTestId('discard')).toBeInTheDocument()
      expect(screen.getByTestId('hand-cards')).toBeInTheDocument()
    })
    
    it('displays deck and discard information', () => {
      render(<GameScreen />)
      
      expect(screen.getByText(/Deck: 10 cards/)).toBeInTheDocument()
      expect(screen.getByText(/Top: card-top, Count: 5/)).toBeInTheDocument()
    })
    
    it('shows action buttons when it is player\'s turn', () => {
      mockGameState.turnoActual = 1 // Player's turn
      useGame.mockReturnValue({ gameState: mockGameState })
      
      render(<GameScreen />)
      
      expect(screen.getByTestId('button-descartar')).toBeInTheDocument()
      expect(screen.getByTestId('button-finalizar-turno')).toBeInTheDocument()
    })
    
    it('hides action buttons when it is not player\'s turn', () => {
      render(<GameScreen />)
      
      expect(screen.queryByTestId('button-descartar')).not.toBeInTheDocument()
      expect(screen.queryByTestId('button-finalizar-turno')).not.toBeInTheDocument()
    })
    
    it('shows game end modal when game has ended', () => {
      mockGameState.gameEnded = true
      useGame.mockReturnValue({ gameState: mockGameState })
      
      render(<GameScreen />)
      
      expect(screen.getByTestId('game-end-modal')).toBeInTheDocument()
    })
  })

  describe('Card Selection', () => {
    it('allows selecting cards', () => {
      render(<GameScreen />)
      
      const selectButton = screen.getByText('Select Card 1')
      fireEvent.click(selectButton)
      
      expect(screen.getByText(/Selected: card-1/)).toBeInTheDocument()
    })
    
    it('allows deselecting cards', () => {
      render(<GameScreen />)
      
      const selectButton = screen.getByText('Select Card 1')
      fireEvent.click(selectButton) // Select
      fireEvent.click(selectButton) // Deselect
      
      expect(screen.getByText(/Selected:$/)).toBeInTheDocument()
    })
    
    it('allows selecting multiple cards', () => {
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByText('Select Card 2'))
      
      expect(screen.getByText(/Selected: card-1, card-2/)).toBeInTheDocument()
    })
  })

  describe('Discard Action', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1 // Player's turn
      useGame.mockReturnValue({ gameState: mockGameState })
    })
    
    /*
    it('shows error when trying to discard without selecting cards', async () => {
      render(<GameScreen />)
      
      const discardButton = screen.getByTestId('button-descartar')
      fireEvent.click(discardButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Debes seleccionar al menos una carta/)).toBeInTheDocument()
      })
    })
    */
    
    it('calls discard API with selected cards', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      // Select a card
      fireEvent.click(screen.getByText('Select Card 1'))
      
      // Click discard
      const discardButton = screen.getByTestId('button-descartar')
      fireEvent.click(discardButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/game/room-456/discard',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'HTTP_USER_ID': '1'
            },
            body: expect.stringContaining('card-1')
          })
        )
      })
    })
    
    it('handles discard API error - not your turn', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Not your turn' })
      })
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByTestId('button-descartar'))
      
      await waitFor(() => {
        expect(screen.getByText(/No es tu turno/)).toBeInTheDocument()
      })
    })
    
    it('handles discard API error - validation error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid cards' })
      })
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByTestId('button-descartar'))
      
      await waitFor(() => {
        expect(screen.getByText(/Error de validación/)).toBeInTheDocument()
      })
    })
    
    it('clears selected cards after successful discard', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByTestId('button-descartar'))
      
      await waitFor(() => {
        expect(screen.getByText(/Selected:$/)).toBeInTheDocument()
      })
    })
  })

  describe('Finish Turn Action', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1 // Player's turn
      useGame.mockReturnValue({ gameState: mockGameState })
    })
    
    it('calls finish turn API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      const finishButton = screen.getByTestId('button-finalizar-turno')
      fireEvent.click(finishButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/game/room-456/finish-turn',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ user_id: 1 })
          })
        )
      })
    })
    
    it('disables finish turn when cards are selected', () => {
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      
      const finishButton = screen.getByTestId('button-finalizar-turno')
      expect(finishButton).toBeDisabled()
    })
    
    it('handles finish turn API error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Not your turn' })
      })
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByTestId('button-finalizar-turno'))
      
      await waitFor(() => {
        expect(screen.getByText(/No es tu turno/)).toBeInTheDocument()
      })
    })
  })

  describe('Pick from Deck Action', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1 // Player's turn
      useGame.mockReturnValue({ gameState: mockGameState })
    })
    
    it('calls pick from deck API when deck is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      const deck = screen.getByTestId('deck')
      fireEvent.click(deck)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/game/room-456/take-deck',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'HTTP_USER_ID': '1'
            }
          })
        )
      })
    })
    
    it('disables deck when not player\'s turn', () => {
      mockGameState.turnoActual = 2 // Not player's turn
      useGame.mockReturnValue({ gameState: mockGameState })
      
      render(<GameScreen />)
      
      const deck = screen.getByTestId('deck')
      fireEvent.click(deck)
      
      expect(global.fetch).not.toHaveBeenCalled()
    })
    
    it('clears selected cards after picking from deck', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      // Select a card first
      fireEvent.click(screen.getByText('Select Card 1'))
      
      // Pick from deck
      fireEvent.click(screen.getByTestId('deck'))
      
      await waitFor(() => {
        expect(screen.getByText(/Selected:$/)).toBeInTheDocument()
      })
    })
    
    it('handles pick from deck API error - room not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Room not found' })
      })
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByTestId('deck'))
      
      await waitFor(() => {
        expect(screen.getByText(/Sala no encontrada/)).toBeInTheDocument()
      })
    })
  })

  /*
  describe('Error Handling', () => {
    it('displays error messages', async () => {
      mockGameState.turnoActual = 1
      useGame.mockReturnValue({ gameState: mockGameState })
      
      render(<GameScreen />)
      
      const discardButton = screen.getByTestId('button-descartar')
      fireEvent.click(discardButton)
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/Debes seleccionar/)
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage.closest('div')).toHaveClass('bg-red-600')
      })
    })

    it('clears error after successful action', async () => {
      mockGameState.turnoActual = 1
      useGame.mockReturnValue({ gameState: mockGameState })
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })
      
      render(<GameScreen />)
      
      // Trigger error
      fireEvent.click(screen.getByTestId('button-descartar'))
      
      await waitFor(() => {
        expect(screen.getByText(/Debes seleccionar/)).toBeInTheDocument()
      })
      
      // Perform successful action
      fireEvent.click(screen.getByText('Select Card 1'))
      fireEvent.click(screen.getByTestId('button-descartar'))
      
      await waitFor(() => {
        expect(screen.queryByText(/Debes seleccionar/)).not.toBeInTheDocument()
      })
    }) 
  })
  */
  
  /*
  describe('Loading States', () => {
    beforeEach(() => {
      mockGameState.turnoActual = 1
      useGame.mockReturnValue({ gameState: mockGameState })
    })
    
    it('disables buttons during loading', async () => {
      let resolvePromise
      global.fetch.mockReturnValueOnce(
        new Promise(resolve => { resolvePromise = resolve })
      )
      
      render(<GameScreen />)
      
      fireEvent.click(screen.getByText('Select Card 1'))
      const discardButton = screen.getByTestId('button-descartar')
      fireEvent.click(discardButton)
      
      expect(discardButton).toBeDisabled()
      
      // Resolve the promise
      resolvePromise({ ok: true, json: async () => ({}) })
      
      await waitFor(() => {
        expect(discardButton).not.toBeDisabled()
      })
    })
  }) 
  */
})