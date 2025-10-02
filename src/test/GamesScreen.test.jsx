// /GamesScreen.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GamesScreen from '../containers/GamesScreen/GamesScreen.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useGame } from '../context/GameContext.jsx'
import { MemoryRouter } from 'react-router-dom'

// --- Mocks ---
vi.mock('../context/UserContext.jsx')
vi.mock('../context/GameContext.jsx')

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

const renderWithProviders = (ui) =>
  render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  )

describe('GamesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // mock useGame en todos los tests
    useGame.mockReturnValue({
      gameState: { room: null, players: [] },
      gameDispatch: vi.fn(),
      connectToGame: vi.fn(),
    })
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

    renderWithProviders(<GamesScreen />)

    await waitFor(() => {
      expect(screen.getByText('Sala 1')).toBeInTheDocument()
      expect(screen.getByText('Sala 2')).toBeInTheDocument()
      expect(screen.getByText('Sala 3')).toBeInTheDocument()
    })

    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByText('Actualizar')).toBeInTheDocument()
  })

  it('muestra LobbyError si el usuario no está logueado', () => {
    useUser.mockReturnValue({
      userState: { name: '', avatarPath: '', birthdate: '', isHost: false },
    })

    renderWithProviders(<GamesScreen />)

    expect(screen.getByText(/Debes iniciar sesion/)).toBeInTheDocument()
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

    renderWithProviders(<GamesScreen />)

    const button = await screen.findByText('Actualizar')
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2) // inicial + click
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

    renderWithProviders(<GamesScreen />)

    await screen.findByText('Sala 2')

    const salaLlenaButton = screen.getAllByRole('button', { name: /Ingresar/i })[1]
    fireEvent.click(salaLlenaButton)

    expect(mockNavigate).not.toHaveBeenCalled()
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

    renderWithProviders(<GamesScreen />)

    await waitFor(() => {
      const salas = screen.getAllByText(/Sala/)
      const nombres = salas.map((el) => el.textContent)
      expect(nombres).toEqual(['Sala 3', 'Sala 2', 'Sala 1'])
    })
  })
})

it('maneja error al cargar partidas', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  global.fetch = vi.fn(() => Promise.reject(new Error('Error de red')))
  
  useUser.mockReturnValue({
    userState: {
      name: 'Juan',
      avatarPath: '/avatar.png',
      birthdate: '2000-01-01',
      isHost: true,
    },
  })

  renderWithProviders(<GamesScreen />)

  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled()
  })

  errorSpy.mockRestore()
})
