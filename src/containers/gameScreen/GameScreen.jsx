import "../../index.css"
import { useUser } from "../../context/UserContext.jsx";
import ProfileCard from "../../components/ProfileCard";
import { useGame } from "../../context/GameContext.jsx";
import { useState } from "react";
import Deck from "../../components/Deck.jsx";
import Discard from "../../components/Discard.jsx";
import GameEndModal from '../../components/GameEndModal'
import HandCards from "../../components/HandCards.jsx";
import Secrets from "../../components/Secrets.jsx"


export default function GameScreen() {
  const { userState } = useUser()
  const { gameState } = useGame()

  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCardSelect = cardId => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      } else {
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
      const response = await fetch(`/game/${roomId}/discard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_ids: selectedCards,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      // Log game state with response data
      console.log('Discard successful:', data)

      // Clear selected cards after successful discard
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

    try {
      const response = await fetch(`/game/${roomId}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rule: 'auto',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()

      // Log game state with response data
      console.log('Skip successful:', data)
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

      <div className="relative z-10 h-screen p-4">
        {/* Profile Card - Upper Left */}
        <div className="absolute top-4 left-4">
          <ProfileCard
            name={userState.name}
            host={userState.isHost}
            avatar={userState.avatarPath}
            birthdate={userState.birthdate}
          />
        </div>

        {/* Secretos - Top Center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <h2 className="text-white text-xl font-bold mb-4 text-center">
            Secretos
          </h2>
          <Secrets />
        </div>

        {/* Mazos Placeholder */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-white text-xl font-bold mb-4 text-center">
            Mazos
          </h2>
          <div className="flex flex-col items-center space-y-3">
            {/* Top row - 2 cards */}
            <div className="flex space-x-3">
              <Deck cardsLeft={gameState.mazos?.mazo_principal ?? 0} />
              <Discard
                topDiscardedCard={gameState.mazos?.top_descarte?.img ?? null}
                counterDiscarded={gameState.mazos?.mazo_descarte ?? 0}
              />
            </div>
          </div>
        </div>

        {/* Cartas en mano placeholder */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <h2 className="text-white text-xl font-bold mb-4 text-center">
            Cartas en mano
          </h2>
          <HandCards selectedCards={selectedCards} onSelect={handleCardSelect} />
        </div>

        {gameState.turnoActual ==
        userState.name /* Interfaz de acciones de turno placeholder */ ? (
          <div className="absolute bottom-4 right-4">
            <h2 className="text-white text-lg font-bold mb-4">Acciones</h2>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-20 py-5 font-semibold transition border-4 bg-[#3D0800] text-[#B49150] border-[#825012] hover:bg-[#4a0a00] focus:outline-none focus:ring-2 focus:ring-[#825012]/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3D0800]"
              >
                {loading ? 'Procesando...' : 'Skip'}
              </button>
              <button
                onClick={handleDiscard}
                disabled={loading || selectedCards.length === 0}
                className="px-20 py-5 font-semibold transition border-4 bg-[#3D0800] text-[#B49150] border-[#825012] hover:bg-[#4a0a00] focus:outline-none focus:ring-2 focus:ring-[#825012]/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3D0800]"
              >
                {loading ? 'Procesando...' : 'Discard'}
              </button>
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
