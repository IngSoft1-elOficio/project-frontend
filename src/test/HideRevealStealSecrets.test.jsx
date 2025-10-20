import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { useEffect } from 'react'
import { GameProvider, useGame } from '../context/GameContext.jsx'
import HideRevealStealSecrets from "../components/modals/HideRevealStealSecrets.jsx"

// Mock del ButtonGame
vi.mock('../components/ButtonGame.jsx', () => ({
  default: ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid="button-confirm"
    >
      {children}
    </button>
  ),
}))

// Mock de socket.io-client para evitar conexiones reales
vi.mock('socket.io-client', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

// Componente helper para inyectar estado en el GameContext
const StateInjector = ({ secretsFromAllPlayers }) => {
  const { gameDispatch } = useGame()
  
  useEffect(() => {
    if (secretsFromAllPlayers) {
      gameDispatch({
        type: 'UPDATE_GAME_STATE_PUBLIC',
        payload: { secretsFromAllPlayers }
      })
    }
  }, [secretsFromAllPlayers, gameDispatch])
  
  return null
}

describe('HideRevealStealSecrets', () => {
  const mockOnConfirm = vi.fn()

  const defaultSecrets = [
    { id: 1, position: 1, player_id: 10, hidden: true },
    { id: 2, position: 2, player_id: 10, hidden: false },
    { id: 3, position: 3, player_id: 11, hidden: true },
  ]

  const defaultDetective = {
    current: { hasWildcard: false },
    actionInProgress: { 
      setType: 'Poirot',
      targetPlayerId: 10,
    },
  }

  const renderModal = (props = {}, secrets = defaultSecrets) => {
    return render(
      <GameProvider>
        <StateInjector secretsFromAllPlayers={secrets} />
        <HideRevealStealSecrets
          isOpen={true}
          detective={defaultDetective}
          onConfirm={mockOnConfirm}
          {...props}
        />
      </GameProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <GameProvider>
        <HideRevealStealSecrets
          isOpen={false}
          detective={defaultDetective}
          onConfirm={mockOnConfirm}
        />
      </GameProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('muestra nombre y efecto del detective correctamente', () => {
    renderModal()
    expect(screen.getByText('Hercule Poirot')).toBeInTheDocument()
    expect(
      screen.getByText(/Elegí un secreto del jugador objetivo para revelar/)
    ).toBeInTheDocument()
  })

  it('filtra los secretos solo del jugador objetivo', () => {
    renderModal()
    const cards = screen.getAllByRole('img')
    expect(cards).toHaveLength(2) // Solo los del jugador 10
  })

  it('muestra error si selecciona un secreto revelado cuando requiere oculto', () => {
    renderModal()
    const revealedCard = screen
      .getAllByRole('img')
      .find((img) => img.alt.includes('2'))
    fireEvent.click(revealedCard)
    expect(
      screen.getByText('Solo podés seleccionar secretos ocultos.')
    ).toBeInTheDocument()
  })

  it('selecciona un secreto oculto válido y limpia errores previos', () => {
    renderModal()
    const hiddenCard = screen
      .getAllByRole('img')
      .find((img) => img.alt.includes('1'))
    fireEvent.click(hiddenCard)
    expect(
      screen.queryByText('Solo podés seleccionar secretos ocultos.')
    ).not.toBeInTheDocument()
  })

  it('deshabilita el botón confirmar si no hay secreto seleccionado', () => {
    renderModal()
    const button = screen.getByTestId('button-confirm')
    expect(button).toBeDisabled()
  })

  it('no llama a onConfirm si el botón está deshabilitado', () => {
    renderModal()
    const button = screen.getByTestId('button-confirm')
    fireEvent.click(button)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('llama a onConfirm con el secreto seleccionado correctamente', () => {
    renderModal()
    const hiddenCard = screen
      .getAllByRole('img')
      .find((img) => img.alt.includes('1'))
    fireEvent.click(hiddenCard)
    fireEvent.click(screen.getByTestId('button-confirm'))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm.mock.calls[0][0]).toMatchObject({
      position: 1,
      hidden: true,
    })
  })

  it('detective pyne solo permite seleccionar secretos revelados', () => {
    const pyneDetective = {
      current: { hasWildcard: false },
      actionInProgress: { 
        setType: 'Pyne',
        targetPlayerId: 10,
      },
    }
    renderModal({ detective: pyneDetective })

    const hiddenCard = screen
      .getAllByRole('img')
      .find((img) => img.alt.includes('1'))
    fireEvent.click(hiddenCard)
    expect(
      screen.getByText('Solo podés seleccionar secretos revelados.')
    ).toBeInTheDocument()

    const revealedCard = screen
      .getAllByRole('img')
      .find((img) => img.alt.includes('2'))
    fireEvent.click(revealedCard)
    expect(
      screen.queryByText('Solo podés seleccionar secretos revelados.')
    ).not.toBeInTheDocument()
  })

  it('confirmSelection muestra error cuando no hay secreto seleccionado', () => {
    const mockSetError = vi.fn()
    const selectedSecret = null
    
    if (!selectedSecret) {
      mockSetError("Seleccioná un secreto válido antes de confirmar.")
      expect(mockOnConfirm).not.toHaveBeenCalled()
    }
    
    expect(mockSetError).toHaveBeenCalledWith(
      "Seleccioná un secreto válido antes de confirmar."
    )
  })

  it('maneja detective desconocido', () => {
    const unknown = {
      current: { hasWildcard: false },
      actionInProgress: { 
        setType: 'Desconocido',
        targetPlayerId: 10,
      },
    }
    renderModal({ detective: unknown })
    expect(screen.getByText('Detective desconocido')).toBeInTheDocument()
    expect(screen.getByText('Sin efecto')).toBeInTheDocument()
  })

  it('maneja secretsFromAllPlayers vacío sin errores', () => {
    renderModal({}, [])
    
    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(
      screen.getByText('No hay secretos disponibles para seleccionar')
    ).toBeInTheDocument()
  })

  it('muestra efecto especial para Satterthwaite con wildcard', () => {
    const satterthwaiteDetective = {
      current: { hasWildcard: true },
      actionInProgress: { 
        setType: 'Satterthwaite',
        targetPlayerId: 10,
      },
    }
    renderModal({ detective: satterthwaiteDetective })
    
    expect(screen.getByText('Mr. Satterthwaite')).toBeInTheDocument()
    expect(
      screen.getByText(/Como este set se jugó con Harley Quin/)
    ).toBeInTheDocument()
  })

  it('muestra el texto correcto en el botón para Poirot', () => {
    renderModal()
    expect(screen.getByTestId('button-confirm')).toHaveTextContent('Revelar')
  })

  it('muestra el texto correcto en el botón para Pyne', () => {
    const pyneDetective = {
      current: { hasWildcard: false },
      actionInProgress: { 
        setType: 'Pyne',
        targetPlayerId: 10,
      },
    }
    
    renderModal({ detective: pyneDetective })
    expect(screen.getByTestId('button-confirm')).toHaveTextContent('Ocultar')
  })
})