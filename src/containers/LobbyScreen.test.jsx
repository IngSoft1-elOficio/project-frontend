//LobbyScreen.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import LobbyScreen from './LobbyScreen'
import { useUser, UserProvider } from '../context/UserContext'
import { vi } from 'vitest'

//Mocks declaration
//React-router-dom mock
//Replace useNavigate() with mockNavigate which we can spy
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

//UserContext mock
//Replace hooks with mocks
vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
  UserProvider: ({ children }) => <div>{children}</div>,
}))

//Childs mock
//Instead use real componenet we use childs whose are faster
//Simplified version of LobbyScreen with crucial components

//LobbyContent mock
vi.mock('../components/LobbyContent', () => ({
  default: ({ player, handleLogout }) => (
    <div>
      <p>LobbyContent renderizado</p>
      <p>Player: {player.name}</p>
      <button onClick={handleLogout}>Salir</button>
    </div>
  ),
}))

//LobbyError mock
vi.mock('../components/LobbyError', () => ({
  default: ({ navigate }) => (
    <div>
      <p>LobbyError renderizado</p>
      <button onClick={() => navigate('ingreso')}>Ir a ingreso</button>
    </div>
  ),
}))

//Background mock
vi.mock('../components/Background', () => ({
  default: ({ children }) => <div data-testid="background">{children}</div>,
}))

describe('LobbyScreen', () => {
  let mockDispatch

  beforeEach(() => {
    mockDispatch = vi.fn()
    ;(useUser).mockReturnValue({
      userState: {
        name: '',
        avatarPath: '',
        birthdate: null,
        isHost: false,
      },
      userDispatch: mockDispatch,
    })
    mockNavigate.mockReset()
  })

  test('renderiza LobbyContent cuando el player está logueado', () => {
    ;(useUser).mockReturnValue({
      userState: {
        name: 'Jugador',
        isHost: false,
        avatarPath: '/images/avatar_4.png',
        birthdate: '21/09/1995',
      },
      userDispatch: mockDispatch,
    })

    render(<LobbyScreen />)

    expect(screen.getByText(/LobbyContent renderizado/)).toBeInTheDocument()
    expect(screen.getByText(/Jugador/)).toBeInTheDocument()
  })

  test('renderiza LobbyError cuando el player NO está logueado', () => {
    ;(useUser).mockReturnValue({
      userState: {
        name: '',
        isHost: false,
        avatarPath: '',
        birthdate: '',
      },
      userDispatch: mockDispatch,
    })

    render(<LobbyScreen />)

    expect(screen.getByText(/LobbyError renderizado/)).toBeInTheDocument()
  })

  test('ejecuta logout correctamente', () => {
    ;(useUser).mockReturnValue({
      userState: {
        name: 'Jugador',
        isHost: false,
        avatarPath: '/images/avatar_4.png',
        birthdate: '21/09/1995',
      },
      userDispatch: mockDispatch,
    })

    render(<LobbyScreen />)

    fireEvent.click(screen.getByText('Salir'))

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_USER' })
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
