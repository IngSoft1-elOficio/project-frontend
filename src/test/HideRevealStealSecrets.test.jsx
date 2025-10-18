import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HideRevealStealSecrets from "../components/modals/HideRevealStealSecrets.jsx"

// Mock del botón reutilizado en el modal
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

describe('HideRevealStealSecrets', () => {
  const mockOnConfirm = vi.fn()

  const defaultDetective = {
    current: { setType: 'Poirot' },
    actionInProgress: { setType: 'Poirot' },
    targetPlayerId: 10,
    secretsPool: [
      { position: 1, playerId: 10, hidden: true },
      { position: 2, playerId: 10, hidden: false },
      { position: 3, playerId: 11, hidden: true },
    ],
  }

  const renderModal = (props = {}) =>
    render(
      <HideRevealStealSecrets
        isOpen={true}
        detective={defaultDetective}
        onConfirm={mockOnConfirm}
        {...props}
      />
    )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <HideRevealStealSecrets
        isOpen={false}
        detective={defaultDetective}
        onConfirm={mockOnConfirm}
      />
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
    expect(cards).toHaveLength(2)
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
      ...defaultDetective,
      current: { setType: 'Pyne' },
      actionInProgress: { setType: 'Pyne' },
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

  it('maneja detective desconocido', () => {
    const unknown = {
      ...defaultDetective,
      current: { setType: 'Desconocido' },
      actionInProgress: { setType: 'Desconocido' },
    }
    renderModal({ detective: unknown })
    expect(screen.getByText('Detective desconocido')).toBeInTheDocument()
    expect(screen.getByText('Sin efecto')).toBeInTheDocument()
  })

  it('maneja secretsPool vacío sin errores', () => {
    renderModal({
      detective: { ...defaultDetective, secretsPool: [] },
    })
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
})
