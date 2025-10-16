import '../../index.css'
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { useState, useMemo } from 'react'
import Deck from '../../components/Deck.jsx'
import Discard from '../../components/Discard.jsx'
import GameEndModal from '../../components/GameEndModal'
import HandCards from '../../components/HandCards.jsx'
import Secrets from '../../components/Secrets.jsx'
import { useEffect } from 'react'
import ButtonGame from '../../components/ButtonGame.jsx'
import Draft from '../../components/game/Draft.jsx'
import PlayerSetsModal from '../../components/modals/PlayerSets.jsx'

export default function GameScreen() {
  const { userState } = useUser()
  const { gameState, gameDispatch } = useGame()

  useEffect(() => {
    console.log('Game state at play game: ', gameState)
    console.log('User state at playgame: ', userState)
  }, [gameState, userState])

  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPlayerSets, setShowPlayerSets] = useState(false)

  const roomId = gameState?.gameId || gameState?.roomId

  // Obtener los sets del jugador actual
  const playerSets = useMemo(() => {
    // Si gameState.sets no existe, retornar array vacío
    if (!gameState.sets) {
      console.log('⚠️ gameState.sets no está disponible')
      return []
    }

    // Filtrar solo los sets del jugador actual
    const filteredSets = gameState.sets.filter(
      set => set.owner === userState.id || set.player_id === userState.id
    )

    console.log('✅ Sets del jugador:', filteredSets)
    console.log(`   Total: ${filteredSets.length}`)

    return filteredSets
  }, [gameState.sets, userState.id])

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
      const cardsWithOrder = selectedCards.map((cardId, index) => ({
        order: index + 1,
        card_id: cardId,
      }))
      console.log('Orden de descarte:', cardsWithOrder)

      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/discard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(), // Add user_id header
          },
          body: JSON.stringify({
            card_ids: cardsWithOrder,
          }),
        }
      )

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

  const handleFinishTurn = async () => {
    setLoading(true)
    setError(null)

    console.log('Attempting finish turn:', {
      turnoActual: gameState.turnoActual,
      userId: userState.id,
      isMyTurn: gameState.turnoActual === userState.id,
    })

    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/finish-turn`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userState.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
      console.log('finish turn successful:', data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePickFromDeck = async () => {
    setLoading(true)
    setError(null)

    console.log('Attempting to pick from deck:', {
      turnoActual: gameState.turnoActual,
      userId: userState.id,
      isMyTurn: gameState.turnoActual === userState.id,
    })

    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/take-deck`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            user_id: userState.id,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
      console.log('Pick from deck successful:', data)

      setSelectedCards([])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDraft = async cardId => {
    try {
      const response = await fetch(
        `http://localhost:8000/game/${gameState.roomId}/draft/pick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            card_id: cardId,
          }),
        }
      )

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

  const handleCreateSet = () => {
    // Validación: al menos una carta
    if (selectedCards.length === 0) {
      console.log('❌ Error: No hay cartas seleccionadas')
      setError('Debes seleccionar al menos una carta de detective')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Validación: detectar tipo de set
    const setType = detectSetType(selectedCards)
    if (!setType) {
      console.log('❌ Error: No se pudo detectar tipo de set')
      setError('Las cartas seleccionadas no forman un set válido')
      setTimeout(() => setError(null), 3000) // Desaparece después de 5 segundos
      return
    }

    // Validación: cantidad mínima según tipo
    const minCards = {
      poirot: 3,
      marple: 3,
      satterthwaite: 2,
      pyne: 2,
      eileenbrent: 2,
      beresford: 2,
    }

    console.log(`📊 Cartas necesarias para ${setType}: ${minCards[setType]}`)

    if (selectedCards.length < minCards[setType]) {
      console.log('❌ Error: No hay suficientes cartas')
      setError(
        `Set de ${setType} requiere al menos ${minCards[setType]} cartas`
      )
      setTimeout(() => setError(null), 3000) // Desaparece después de 5 segundos
      return
    }

    console.log('Crear set - pendiente implementar')
    console.log('Cartas seleccionadas:', selectedCards)
    console.log('Tipo de set detectado:', setType)
    console.log('Tiene comodín:', checkForWildcard(selectedCards))
    // TO DO: Implementar cuando el backend esté listo
    // POST /api/game/{room_id}/play-detective-set
  }

  // ========== HELPER FUNCTIONS ==========

  // Helper: Detectar el tipo de set basado en las cartas seleccionadas
  const detectSetType = cardIds => {
    const selectedCardData = gameState.mano.filter(card =>
      cardIds.includes(card.id)
    )

    if (selectedCardData.length === 0) return null

    // Verificar que todas sean cartas de detective
    const nonDetectiveCards = selectedCardData.filter(
      card => card.type !== 'DETECTIVE'
    )
    if (nonDetectiveCards.length > 0) {
      console.log('⚠️ Hay cartas que no son de detective:', nonDetectiveCards)
      return null
    }

    // Mapeo de nombres a tipos de set
    const nameToSetType = {
      'Hercule Poirot': 'poirot',
      'Miss Marple': 'marple',
      'Mr Satterthwaite': 'satterthwaite',
      'Parker Pyne': 'pyne',
      'Lady Eileen "Bundle" Brent': 'eileenbrent',
      'Tommy Beresford': 'beresford',
      'Tuppence Beresford': 'beresford',
      'Harley Quin Wildcard': 'wildcard',
    }

    // Separar comodines de cartas normales
    const wildcards = selectedCardData.filter(
      card => nameToSetType[card.name] === 'wildcard'
    )
    const normalCards = selectedCardData.filter(
      card => nameToSetType[card.name] !== 'wildcard'
    )

    // Debe haber al menos 1 carta normal (no solo comodines)
    if (normalCards.length === 0) {
      console.log('⚠️ Solo hay comodines, no es válido')
      return null
    }

    // Obtener los tipos únicos (sin comodines)
    const uniqueTypes = [
      ...new Set(normalCards.map(card => nameToSetType[card.name])),
    ]

    // Caso especial: Beresford acepta Tommy + Tuppence
    if (uniqueTypes.includes('beresford')) {
      // Verificar que TODAS las cartas normales sean Beresford
      if (uniqueTypes.length === 1 && uniqueTypes[0] === 'beresford') {
        return 'beresford'
      } else if (uniqueTypes.length > 1) {
        console.log('⚠️ Mezclando Beresford con otros tipos')
        return null
      }
    }

    // Para el resto: todas las cartas normales deben ser del mismo tipo
    if (uniqueTypes.length !== 1) {
      console.log('⚠️ Cartas de diferentes tipos:', uniqueTypes)
      return null
    }

    return uniqueTypes[0]
  }

  // Helper: Verificar si hay un comodín (Harley Quin) en las cartas seleccionadas
  const checkForWildcard = cardIds => {
    const selectedCardData = gameState.mano.filter(card =>
      cardIds.includes(card.id)
    )

    return selectedCardData.some(card => card.name === 'Harley Quin Wildcard')
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
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl"
          style={{ zIndex: 9999, minWidth: '300px' }}
        >
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

        <div
          className="absolute top-1/2 left-0 w-full flex items-center justify-center gap-12 px-4"
          style={{ transform: 'translateY(-50%)' }}
        >
          {/* Mazos */}
          <div className="flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Mazos
            </h2>
            <Deck
              cardsLeft={gameState.mazos?.deck?.count ?? 0}
              onClick={handlePickFromDeck}
              disabled={
                gameState.turnoActual !== userState.id ||
                gameState.drawAction.cardsToDrawRemaining === 0 ||
                !gameState.drawAction.hasDiscarded
              }
            />
          </div>

          {/* Draft */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Draft
            </h2>
            <Draft
              handleDraft={handleDraft}
              disabled={
                gameState.turnoActual !== userState.id ||
                gameState.drawAction.cardsToDrawRemaining === 0 ||
                !gameState.drawAction.hasDiscarded
              }
            />
          </div>

          {/* Descartar */}
          <div className="flex flex-col items-center">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Descartar
            </h2>
            <Discard
              topDiscardedCard={gameState.mazos?.discard?.top ?? ''}
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

        {gameState.turnoActual == userState.id ? (
          <div className="absolute bottom-4 right-4">
            <h2 className="text-white text-lg font-bold mb-4">Acciones</h2>
            <div className="flex flex-col space-y-3">
              {/* Mensaje de estado */}
              <div className="text-white text-sm mb-3 bg-black/50 px-3 py-2 rounded">
                {!gameState.drawAction.hasDiscarded &&
                  'Descarta cartas primero'}
                {gameState.drawAction.hasDiscarded &&
                  !gameState.drawAction.hasDrawn &&
                  `Roba ${gameState.drawAction.cardsToDrawRemaining} carta(s)`}
                {gameState.drawAction.hasDiscarded &&
                  gameState.drawAction.hasDrawn &&
                  'Puedes finalizar turno'}
              </div>

              {/* Botones */}
              {/* Botón para descartar cartas */}
              <ButtonGame
                onClick={handleDiscard}
                disabled={
                  selectedCards.length === 0 ||
                  loading ||
                  gameState.drawAction.hasDiscarded
                }
              >
                Descartar
              </ButtonGame>

              <ButtonGame
                onClick={() => setShowPlayerSets(true)}
                disabled={loading || gameState.drawAction.hasDiscarded}
              >
                Ver Sets
              </ButtonGame>

              {/* Botón para saltar turno */}
              {gameState.drawAction.hasDiscarded &&
                gameState.drawAction.hasDrawn &&
                selectedCards.length === 0 && (
                  <ButtonGame onClick={handleFinishTurn} disabled={loading}>
                    Finalizar Turno
                  </ButtonGame>
                )}
            </div>
          </div>
        ) : null}

        {gameState?.gameEnded && (
          <GameEndModal
            ganaste={gameState.ganaste}
            winners={gameState.winners}
            finish_reason={gameState.finish_reason || 'La partida ha terminado'}
          />
        )}
      </div>
      {/* Modal de sets */}
      <PlayerSetsModal
        isOpen={showPlayerSets}
        onClose={() => setShowPlayerSets(false)}
        sets={playerSets} // Ajusta según la estructura de tu contexto
        selectedCards={selectedCards}
        onCardSelect={handleCardSelect}
        onCreateSet={handleCreateSet}
      />
    </main>
  )
}
