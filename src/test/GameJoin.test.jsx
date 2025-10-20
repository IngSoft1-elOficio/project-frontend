import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import GameJoin from '../containers/GameJoin'
import { useGame } from '../context/GameContext'
import { useUser } from '../context/UserContext'

// Mocks
vi.mock('../context/GameContext')
vi.mock('../context/UserContext')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

global.fetch = vi.fn()

const renderWithRouter = component => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('GameJoin', () => {
  const mockGameDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('muestra el título con el nombre de la sala', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          roomInfo: { name: 'Mi Sala' },
          gameId: 'TEST123',
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      expect(screen.getByText('Partida:')).toBeInTheDocument()
      expect(screen.getByText('Mi Sala')).toBeInTheDocument()
    })

    it('muestra "Sin nombre" cuando no hay roomInfo ni gameId', () => {
      useGame.mockReturnValue({
        gameState: { jugadores: [], roomInfo: null, gameId: null },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      expect(screen.getByText('Sin nombre')).toBeInTheDocument()
    })

    it('muestra la card de jugadores', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      expect(screen.getByText('Jugadores')).toBeInTheDocument()
    })
  })

  describe('Botones de acción', () => {
    it('muestra el botón "Abandonar partida" cuando NO es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      expect(screen.getByText('Abandonar partida')).toBeInTheDocument()
      expect(screen.queryByText('Iniciar partida')).not.toBeInTheDocument()
    })

    it('muestra ambos botones cuando es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      expect(screen.getByText('Cancelar partida')).toBeInTheDocument()
      expect(screen.getByText('Iniciar partida')).toBeInTheDocument()
    })
  })

  describe('Iniciar partida', () => {
    it('llama al endpoint cuando el host inicia la partida', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          turn: { current_player_id: 1 },
          game: { status: 'INGAME' },
          players: [],
        }),
      })
  
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })
  
      renderWithRouter(<GameJoin />)
      const button = screen.getByText('Iniciar partida')
  
      fireEvent.click(button)
  
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/game/123/start',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 1 }),
          })
        )
      })
    })
  
    it('navega a la pantalla de juego después de iniciar', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          turn: { current_player_id: 1 },
          game: { status: 'INGAME' },
          players: [],
        }),
      })
  
      // Crear estado mutable
      let currentGameState = {
        jugadores: [],
        gameId: 'TEST123',
        roomId: 123,
      }
  
      // Mock que devuelve el estado actual
      useGame.mockImplementation(() => ({
        gameState: currentGameState,
        gameDispatch: mockGameDispatch,
      }))
      
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })
  
      // Capturar rerender
      const { rerender } = renderWithRouter(<GameJoin />)
      const button = screen.getByText('Iniciar partida')
  
      fireEvent.click(button)
  
      // Esperar a que el fetch se complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
  
      // Simular actualizacion de estado
      currentGameState = {
        ...currentGameState,
        status: 'INGAME',
      }
  
      // Re-renderizar
      rerender(<GameJoin />)
  
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/game/123')
      })
    })
  
    it('no hace nada si el usuario NO es host', async () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })
  
      renderWithRouter(<GameJoin />)
  
      expect(screen.queryByText('Iniciar partida')).not.toBeInTheDocument()
    })
  })

  describe('Manejo de errores', () => {
    it('muestra mensaje de error cuando falla iniciar partida', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ detail: 'Not enough players' }),
      })

      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })

      renderWithRouter(<GameJoin />)
      const button = screen.getByText('Iniciar partida')

      fireEvent.click(button)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('captura errores de red al iniciar partida', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      global.fetch.mockRejectedValue(new Error('Network error'))

      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })

      renderWithRouter(<GameJoin />)
      const button = screen.getByText('Iniciar partida')

      fireEvent.click(button)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Fallo en handleStart:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Callback de errores del botón Exit', () => {
    it('muestra y limpia mensaje de error cuando ExitGameButton llama onError', async () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      // Simular que ExitGameButton llama a onError
      const exitButton = screen.getByText('Abandonar partida')

      // Mock del fetch para simular error
      global.fetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ detail: 'Game already started' }),
      })

      fireEvent.click(exitButton)

      // Esperar a que aparezca el mensaje de error
      await waitFor(
        () => {
          expect(
            screen.getByText('La partida ya ha iniciado')
          ).toBeInTheDocument()
        },
        { timeout: 1000 }
      )

      // Verificar que el mensaje se limpia después de 3 segundos
      await waitFor(
        () => {
          expect(
            screen.queryByText('La partida ya ha iniciado')
          ).not.toBeInTheDocument()
        },
        { timeout: 4000 }
      )
    })
  })

  describe('Notificaciones', () => {
    it('muestra notificación cuando el host cancela la partida', async () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
          gameCancelled: true,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      await waitFor(() => {
        expect(
          screen.getByText('El host cancelo la partida')
        ).toBeInTheDocument()
      })
    })

    it('muestra notificación cuando un jugador abandona', async () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
          playerLeftNotification: {
            playerName: 'Un jugador',
            timestamp: new Date().toISOString(),
          },
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      await waitFor(() => {
        expect(
          screen.getByText('Un jugador abandono la partida')
        ).toBeInTheDocument()
      })
    })

    it('dispara CLEAR_PLAYER_LEFT_NOTIFICATION cuando hay una notificación', async () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
          playerLeftNotification: {
            playerName: 'Un jugador',
            timestamp: new Date().toISOString(),
          },
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: true, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      // Verificar que muestra la notificación
      expect(
        await screen.findByText('Un jugador abandono la partida')
      ).toBeInTheDocument()

      // Verificar que eventualmente llama al dispatch para limpiar
      // (no verificamos el timeout, solo que el dispatch será llamado)
      await waitFor(
        () => {
          expect(mockGameDispatch).toHaveBeenCalledWith({
            type: 'CLEAR_PLAYER_LEFT_NOTIFICATION',
          })
        },
        { timeout: 4000 }
      ) // Dar tiempo suficiente para el setTimeout de 3 segundos
    })
  })

  describe('Navegación automática', () => {
    it('navega cuando el juego ya inició y el usuario NO es host', () => {
      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
          status: 'INGAME',
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      // La navegación ocurre en el useEffect, verificamos que fue llamado
      expect(mockNavigate).toHaveBeenCalledWith('/game/123')
    })

    it('redirige al lobby después de 3 segundos cuando el host cancela', async () => {
      vi.useFakeTimers()

      useGame.mockReturnValue({
        gameState: {
          jugadores: [],
          gameId: 'TEST123',
          roomId: 123,
          gameCancelled: true,
        },
        gameDispatch: mockGameDispatch,
      })
      useUser.mockReturnValue({
        userState: { isHost: false, id: 1 },
      })

      renderWithRouter(<GameJoin />)

      // Avanzar 3 segundos y ejecutar los timers pendientes
      await vi.advanceTimersByTimeAsync(3000)

      expect(mockNavigate).toHaveBeenCalledWith('/lobby')

      vi.useRealTimers()
    })
  })
})
