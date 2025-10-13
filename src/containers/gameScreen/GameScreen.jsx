import '../../index.css'
import { useUser } from '../../context/UserContext.jsx'
import ProfileCard from '../../components/ProfileCard'
import { useGame } from '../../context/GameContext.jsx'
import { useState } from 'react'
import Deck from '../../components/Deck.jsx'
import Discard from '../../components/Discard.jsx'
import GameEndModal from '../../components/GameEndModal'
import HandCards from "../../components/HandCards.jsx";
import Secrets from "../../components/Secrets.jsx"
import { useEffect } from "react";
import ButtonGame from '../../components/ButtonGame.jsx'
import Draft from '../../components/game/Draft.jsx'

export default function GameScreen() {
  const { userState } = useUser()
  const { gameState } = useGame()

  useEffect(() => {
      console.log("Game state at play game: ", gameState);
      console.log("User state at playgame: ", userState);
  }, [gameState, userState])

  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const roomId = gameState?.gameId || gameState?.roomId

  const handleCardSelect = cardId => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      } else {
        console.log('Cards selected:', prev, cardId)
        return [...prev, cardId]
      }
    })
  }
const handleDiscard = async () => {
  if (selectedCards.length === 0) {
    setError('Debes seleccionar al menos una carta para descartar')
    return
  }

  setLoading(true)
  setError(null)

  try {
    const cardsWithOrder = selectedCards.map((cardId, index) => ({
      order: index + 1,
      card_id: cardId
    }))
    console.log('Orden de descarte:', cardsWithOrder)

    const response = await fetch(`http://localhost:8000/game/${gameState.roomId}/discard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP_USER_ID': userState.id.toString()  // Add user_id header
      },
      body: JSON.stringify({
        card_ids: cardsWithOrder,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(getErrorMessage(response.status, errorData))
    }

    const data = await response.json()
    console.log('Discard successful:', data)
    setSelectedCards([])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
const handleSkip = async () => {
  setLoading(true)
  setError(null)

  console.log('Attempting skip:', {
    turnoActual: gameState.turnoActual,
    userId: userState.id,
    isMyTurn: gameState.turnoActual === userState.id
  });

  try {
    const response = await fetch(`http://localhost:8000/game/${gameState.roomId}/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userState.id
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(getErrorMessage(response.status, errorData))
    }

    const data = await response.json()
    console.log('Skip successful:', data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

const handleDraft = async (cardId) => {
  try {
    const response = await fetch(`http://localhost:8000/game/${roomId}/draft/pick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP_USER_ID': userState.id.toString()
      },
      body: JSON.stringify({
        card_id: cardId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(getErrorMessage(response.status, errorData))
    }

    const data = await response.json()
    console.log('Draft successful:', data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  const getErrorMessage = (status, errorData) => {
    switch (status) {
      case 400:
        return 'Error de validación: cartas inválidas o lista vacía'
      case 403:
        return 'No es tu turno'
      case 404:
        return 'Sala no encontrada'
      case 409:
        return 'Reglas de descarte no cumplidas'
      default:
        return errorData?.message || 'Error desconocido'
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <div>

        {/* Secretos - Top Center */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <h2 className="text-white text-xl font-bold mb-2 text-center">
              Secretos
            </h2>
            <Secrets />
          </div>

        <div className="absolute top-1/2 left-0 w-full flex items-center justify-center gap-12 px-4" style={{transform: 'translateY(-50%)'}}>
          {/* Mazos */}
          <div className="flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Mazos</h2>
            <Deck cardsLeft={gameState.mazos?.deck.count ?? 0} />
          </div>

          {/* Draft */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Draft</h2>
            <Draft handleDraft={handleDraft} />
          </div>

          {/* Descartar */}
          <div className="flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">Descartar</h2>
            <Discard
              topDiscardedCard={gameState.mazos?.discard?.top ?? ""}
              counterDiscarded={gameState.mazos?.discard?.count ?? 0}
            />
          </div>
        </div>

        {/* Cartas en mano placeholder */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
          <h2 className="text-white text-xl font-bold mb-2 text-center">
            Cartas en mano
          </h2>
          <HandCards
            selectedCards={selectedCards}
            onSelect={handleCardSelect}
          />
        </div>

        {gameState.turnoActual ==
        userState.id /* Interfaz de acciones de turno placeholder */ ? (
          <div className="absolute bottom-4 right-4">
            <h2 className="text-white text-lg font-bold mb-4">Acciones</h2>
            <div className="flex flex-col space-y-3">
              {/* Botones */}
              {/* Botón para descartar cartas */}
              <ButtonGame
                onClick={handleDiscard}
                disabled={selectedCards.length === 0 || loading}
              >
                Descartar
              </ButtonGame>

              {/* Botón para saltar turno */}
              <ButtonGame
                onClick={handleSkip}
                disabled={loading || selectedCards.length > 0}
              >
                Saltar Turno
              </ButtonGame>
            </div>
          </div>
        ) : (
          <></>
        )}

        {gameState?.gameEnded && (
          <GameEndModal message="El asesino y cómplice ganaron" />
        )}
      </div>
    </main>
  )
}
