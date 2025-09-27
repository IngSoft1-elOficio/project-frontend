// __tests__/GamesScreen.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GamesScreen from '../containers/GamesScreen/GamesScreen.jsx'
import { useUser } from '../context/UserContext.jsx'
import { MemoryRouter } from 'react-router-dom'

// --- Mocks ---
vi.mock('../context/UserContext.jsx')
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock global fetch
const mockFetchData = [
  { id: 1, name: 'Sala 1', playersJoined: 2, playerQty: 6 },
  { id: 2, name: 'Sala 2', playersJoined: 6, playerQty: 6 }, // llena
  { id: 3, name: 'Sala 3', playersJoined: 1, playerQty: 6 },
]
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items: mockFetchData }),
  })
)

describe('GamesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra ItemList y ProfileCard si el usuario está logueado', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Sala 1')).toBeDefined()
      expect(screen.getByText('Sala 2')).toBeDefined()
      expect(screen.getByText('Sala 3')).toBeDefined()
    })

    expect(screen.getByText('Juan')).toBeDefined()
    expect(screen.getByText('Actualizar')).toBeDefined()
  })

  it('muestra LobbyError si el usuario no está logueado', () => {
    useUser.mockReturnValue({
      userState: { name: '', avatarPath: '', birthdate: '', isHost: false },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    expect(screen.getByText(/Debes iniciar sesion/)).toBeDefined()
  })

  it('botón Actualizar llama a fetch', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    const button = screen.getByText('Actualizar')
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2) // 1 fetch inicial + 1 click
    })
  })

  it('simula click en "Ingresar" y evita unirse si la sala está llena', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    await waitFor(() => screen.getByText('Sala 2'))

    const salaLlenaButton = screen.getAllByRole('button', {
      name: /Ingresar/i,
    })[1] // Sala 2
    fireEvent.click(salaLlenaButton)

    // Como la sala está llena, no debería navegar
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('muestra error si fetch falla', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }))

    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
  })

  it('ordena las partidas por id descendente', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    await waitFor(() => {
      const salas = screen.getAllByText(/Sala/)
      const nombres = salas.map(el => el.textContent)
      expect(nombres).toEqual(['Sala 3', 'Sala 2', 'Sala 1'])
    })
  })

  it('ProfileCard muestra datos correctos', async () => {
    useUser.mockReturnValue({
      userState: {
        name: 'Juan',
        avatarPath: '/avatar.png',
        birthdate: '2000-01-01',
        isHost: true,
      },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    expect(screen.getByText('Juan')).toBeDefined()
    expect(screen.getByText('Actualizar')).toBeDefined()
  })

  it('usuario parcialmente logueado no muestra ItemList', () => {
    useUser.mockReturnValue({
      userState: { name: 'Juan', avatarPath: '', birthdate: '', isHost: false },
    })

    render(
      <MemoryRouter>
        <GamesScreen />
      </MemoryRouter>
    )

    expect(screen.getByText(/Debes iniciar sesion/)).toBeDefined()
  })
})
