//LobbyScreen.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import LobbyScreen from './LobbyScreen'
import { useAppContext, useAppDispatch } from '../context/AppContext'
import { vi } from 'vitest'

//Mocks declaration
//React-router-dom mock
//Replace useNavigate() with mockNavigate which we can spy
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

//AppContext mock
//Replace hooks with mocks
vi.mock('../context/AppContext', () => ({
  useAppContext: vi.fn(),
  useAppDispatch: vi.fn(),
}))

//Childs mock
//Instead use real componenet we use childs whose are faster
//Simplefied version of LobbyScreen with crucial components

//LobbyContent mock
//It should show player data and the exit button
//  the other ones are not neccessary to check in this test
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
//It should show the button that appears when user is not logged
//  text is not neccessary to check
vi.mock('../components/LobbyError', () => ({
  default: ({ navigate }) => (
    <div>
      <p>LobbyError renderizado</p>
      <button onClick={() => navigate('ingreso')}>Ir a ingreso</button>
    </div>
  ),
}))

//Background mock
//It should show the background image
vi.mock('../components/Background', () => ({
  default: ({ children }) => <div data-testid="background">{children}</div>,
}))

//describe form a group of tests for LobbyScreen -> legibility
describe('LobbyScreen', () => {
  let mockDispatch

  //This execue before each test
  // ensure that every test starts with a new dispatch and a clean navigate
  beforeEach(() => {
    mockDispatch = vi.fn() //Creates a function that allows spy
    useAppDispatch.mockReturnValue(mockDispatch) //Before we mocked useAppDispatch
    //  now everytime this mock is called it return mockDispatch
    //Clean mockNavigate history so on the next test it starts clean
    mockNavigate.mockReset()
  })

  //Test 1 -> player logged
  test('renderiza LobbyContent cuando el player está logueado', () => {
    useAppContext.mockReturnValue({
      //Simulate a player with their values
      player: {
        name: 'Jugador',
        host: false,
        avatar: '/images/avatar_4.png',
        birthdate: '21/09/1995',
      },
    })

    //Render LobbyScreen
    render(<LobbyScreen />)

    //Verify text in LobbyScreen is "LobbyContent renderizado" and "Jugador"
    expect(screen.getByText(/LobbyContent renderizado/)).toBeInTheDocument()
    expect(screen.getByText(/Jugador/)).toBeInTheDocument()
  })

  //Test 2 -> player not logged
  test('renderiza LobbyError cuando el player NO está logueado', () => {
    useAppContext.mockReturnValue({
      //Simulate player with not logged values
      player: { name: '', host: false, avatar: '', birthdate: '' },
    })

    //Render LobbyScreen
    render(<LobbyScreen />)

    //Verify text in LobbyScreen is "LobbyError renderizado"
    expect(screen.getByText(/LobbyError renderizado/)).toBeInTheDocument()
  })

  //Test 3 -> player logout
  test('ejecuta logout correctamente', () => {
    useAppContext.mockReturnValue({
      //Simulate player values
      player: {
        name: 'Jugador',
        host: false,
        avatar: '/images/avatar_4.png',
        birthdate: '21/09/1995',
      },
    })

    //Render LobbyScreen
    render(<LobbyScreen />)

    //The event starts when button Salir gets click
    fireEvent.click(screen.getByText('Salir'))

    //Check that dispatch has LOGOUT action
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGOUT' })
    //Check that navigate is /ingreso
    expect(mockNavigate).toHaveBeenCalledWith('/ingreso')
  })
})
