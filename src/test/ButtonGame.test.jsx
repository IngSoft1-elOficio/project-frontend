// ButtonGame.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ButtonGame from '../components/ButtonGame.jsx'

describe('ButtonGame', () => {
  it('renderiza el botón con el texto correcto', () => {
    render(<ButtonGame>Click Me</ButtonGame>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('llama a onClick cuando se hace click', () => {
    const handleClick = vi.fn()
    render(<ButtonGame onClick={handleClick}>Click Me</ButtonGame>)

    const button = screen.getByText('Click Me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalled()
  })

  it('aplica la propiedad disabled correctamente', () => {
    const handleClick = vi.fn()
    render(
      <ButtonGame onClick={handleClick} disabled>
        No Click
      </ButtonGame>
    )

    const button = screen.getByText('No Click')
    expect(button).toBeDisabled()

    // No debería llamar onClick si está deshabilitado
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
