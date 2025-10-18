import '../../index.css'
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { useState, useEffect } from 'react'
import Deck from '../../components/Deck.jsx'
import Discard from '../../components/Discard.jsx'
import GameEndModal from '../../components/GameEndModal'
import HandCards from '../../components/HandCards.jsx'
import Secrets from '../../components/Secrets.jsx'
import ButtonGame from '../../components/ButtonGame.jsx'
import Draft from '../../components/game/Draft.jsx'
import Tabs from '../../components/game/Tabs.jsx'
import TabPanel from '../../components/game/TabPanel.jsx'
import Log from '../../components/game/Log.jsx'
import { OtherPlayerSets } from '../../components/game/OtherPlayerSets.jsx'
import PlayerSetsModal from '../../components/modals/PlayerSets.jsx'
import SelectPlayerModal from '../../components/modals/SelectPlayer.jsx'

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
  const [isSelectPlayerOpen, setIsSelectPlayerOpen] = useState(false)

  const roomId = gameState?.gameId || gameState?.roomId

  // Obtener los sets del jugador actual
  const playerSetsForModal = (gameState.sets || [])
    .filter(set => set.owner_id === userState.id)
    .map((set, index) => {
      // set.cards tiene {id, name, description, type, img_src}
      const firstCard = set.cards?.[0]

      const mappedSet = {
        id: index,
        setType: set.set_type,
        setName: firstCard?.name || `Detective Set`,
        cards: set.cards || [],
        hasWildcard: set.hasWildcard || false,
      }

      console.log('SET MAPEADO:', mappedSet)
      console.log('PRIMERA CARTA:', firstCard)

      return mappedSet
    })

  const handleCardSelect = cardId => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId)
      } else {
        return [...prev, cardId]
      }
    })
  }

  const handlePLayEventCard = async (c) => {
    
    // Verificar que es Another Victim, que es la unica carta de evento que vamos a implementar (puede cambiar)
    
    console.log(`Gonna play card: ${c}`);
    
    try {

      const response = await fetch(
        `http://localhost:8000/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(), // Add user_id header
          },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
      console.log('Played card succesfull:', data)
      setSelectedCards([])      
    } catch {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
            HTTP_USER_ID: userState.id.toString(),
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
        `http://localhost:8000/game/${gameState.gameId}/draft/pick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            card_id: cardId,
            user_id: userState.id,
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

  // handlers de selectPlayerModal
  const handlePlayerSelect = jugador => {
    const { actionInProgress } = gameState.eventCards
    const currentEventType = actionInProgress?.eventType
    const detectiveType = gameState.detectiveAction?.actionInProgress?.setType
    const initiatorPlayerId =
      gameState.detectiveAction?.actionInProgress?.initiatorPlayerId
    const isInitiator = initiatorPlayerId === userState.id

    // Caso 1: Another Victim
    if (currentEventType === 'another_victim') {
      gameDispatch({
        type: 'EVENT_ANOTHER_VICTIM_SELECT_PLAYER',
        payload: jugador,
      })
      return
    }

    // Caso 2: Detectives Tipo A (marple, pyne, poirot)
    if (['marple', 'pyne', 'poirot'].includes(detectiveType)) {
      gameDispatch({
        type: 'DETECTIVE_PLAYER_SELECTED',
        payload: { playerId: jugador.id, playerData: jugador },
      })
      return
    }

    // Caso 3: Detectives Tipo B (beresford, satterthwaite)
    if (['beresford', 'satterthwaite'].includes(detectiveType) && isInitiator) {
      gameDispatch({
        type: 'DETECTIVE_PLAYER_SELECTED',
        payload: { playerId: jugador.id, playerData: jugador },
      })
    }
  }

  const handleConfirmSelectPlayer = async () => {
    const { actionInProgress, anotherVictim } = gameState.eventCards
    const currentEventType = actionInProgress?.eventType
    const { detectiveAction } = gameState
    const detectiveType = detectiveAction?.actionInProgress?.setType
    const initiatorPlayerId =
      detectiveAction?.actionInProgress?.initiatorPlayerId
    const isInitiator = initiatorPlayerId === userState.id
    const isTarget =
      detectiveAction?.actionInProgress?.targetPlayerId === userState.id

    console.log('=== CONFIRM SELECT PLAYER ===')
    console.log('currentEventType:', currentEventType)
    console.log('detectiveType:', detectiveType)
    console.log('isInitiator:', isInitiator)
    console.log('isTarget:', isTarget)
    console.log(
      'selectedPlayer (anotherVictim):',
      anotherVictim?.selectedPlayer
    )
    console.log('selectedPlayer (detective):', detectiveAction?.selectedPlayer)

    // CASO 1: Another Victim - Hacer POST al backend
    if (currentEventType === 'another_victim') {
      console.log('-> Entrando en CASO 1: Another Victim')
      const selectedPlayer = anotherVictim?.selectedPlayer
      if (!selectedPlayer) {
        console.log('-> ERROR: No hay selectedPlayer')
        return
      }

      try {
        const response = await fetch(
          `/api/game/${roomId}/event/another-victim`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              card_id: anotherVictim.cardId,
              target_player_id: selectedPlayer.id,
            }),
          }
        )

        if (!response.ok) throw new Error('Error al seleccionar jugador')
        const data = await response.json()

        gameDispatch({ type: 'EVENT_STEP_UPDATE', payload: data })
        setIsSelectPlayerOpen(false)
      } catch (error) {
        console.error('Error en Another Victim:', error)
        gameDispatch({ type: 'EVENT_ANOTHER_VICTIM_COMPLETE' })
        setIsSelectPlayerOpen(false)
      }
      return
    }

    // CASO 2: Detectives Tipo A (marple, pyne, poirot)
    if (['marple', 'pyne', 'poirot'].includes(detectiveType)) {
      console.log('-> Entrando en CASO 2: Detectives Tipo A')
      const selectedPlayer = detectiveAction?.selectedPlayer
      if (!selectedPlayer) {
        console.log('-> ERROR: No hay selectedPlayer')
        return
      }

      gameDispatch({
        type: 'DETECTIVE_OPEN_SECRET_SELECTION',
        payload: {
          targetPlayer: selectedPlayer,
          detectiveType: detectiveType,
        },
      })
      setIsSelectPlayerOpen(false)
      return
    }

    // CASO 3: Detectives Tipo B (beresford, satterthwaite)
    if (['beresford', 'satterthwaite'].includes(detectiveType)) {
      console.log('-> Entrando en CASO 3: Detectives Tipo B')
      if (isInitiator) {
        console.log('-> Fase 1: Iniciador confirmando')
        const selectedPlayer = detectiveAction?.selectedPlayer
        if (!selectedPlayer) {
          console.log('-> ERROR: No hay selectedPlayer')
          return
        }

        gameDispatch({
          type: 'DETECTIVE_TARGET_CONFIRMED',
          payload: {
            targetPlayerId: selectedPlayer.id,
            targetPlayerData: selectedPlayer,
          },
        })
        setIsSelectPlayerOpen(false)
      } else if (isTarget) {
        console.log('-> Fase 2: Target confirmando')
        gameDispatch({
          type: 'DETECTIVE_TARGET_ACKNOWLEDGED_OPEN_SECRETS',
          payload: {
            playerId: userState.id,
            initiatorPlayerId: initiatorPlayerId,
          },
        })
        setIsSelectPlayerOpen(false)
      } else {
        console.log('-> ERROR: No es ni iniciador ni target')
      }
      return
    }

    console.log('-> ERROR: No se cumplió ninguna condición')
  }

  const handleCancelSelectPlayer = () => {
    const { actionInProgress } = gameState.eventCards
    const currentEventType = actionInProgress?.eventType
    const detectiveType = gameState.detectiveAction?.actionInProgress?.setType

    if (currentEventType === 'another_victim') {
      gameDispatch({ type: 'EVENT_ANOTHER_VICTIM_COMPLETE' })
    } else if (detectiveType) {
      gameDispatch({ type: 'DETECTIVE_ACTION_COMPLETE' })
    }
    setIsSelectPlayerOpen(false)
  }

  const handlePlayDetective = async () => {
    console.log(
      'Cartas seleccionadas para el set:',
      gameState.mano.filter(card => selectedCards.includes(card.id))
    )

    // Cantidades minimas de cartas por tipo de set
    const minCards = {
      poirot: 3,
      marple: 3,
      satterthwaite: 2,
      pyne: 2,
      eileenbrent: 2,
      beresford: 2,
    }

    // Caso crear set vacio
    if (selectedCards.length === 0) {
      setError('Debes seleccionar al menos una carta de detective')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Caso crear set invalido
    const setType = detectSetType(selectedCards)
    if (!setType) {
      setError('Las cartas seleccionadas no forman un set válido')
      setTimeout(() => setError(null), 3000)
      return
    }

    // Caso crear set con cartas insuficientes
    if (selectedCards.length < minCards[setType]) {
      setError(
        `Set de ${setType} requiere al menos ${minCards[setType]} cartas`
      )
      setTimeout(() => setError(null), 3000)
      return
    }

    // Detectar si hay comodín
    const hasWildcard = checkForWildcard(selectedCards)

    setLoading(true)
    setError(null)

    // Caso crear set exitoso
    try {
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/play-detective-set`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owner: userState.id,
            setType: setType,
            cards: selectedCards,
            hasWildcard: hasWildcard,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear el set')
      }

      const data = await response.json()
      console.log('Set creado exitosamente!')
      console.log('Action ID:', data.actionId)
      console.log('Next Action:', data.nextAction)

      // Limpiar selección y cerrar modal
      setSelectedCards([])
      setShowPlayerSets(false)

      // Websocket actualiza el gameState con el nuevo set
      //y notifica por detective_action_started
    } catch (err) {
      console.error('❌ Error al crear set:', err)
      setError(err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
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

  const printCardBacks = (n, type) => {

    const arrayForMap = []

    for (let i = 0; i < n; i++) {
      arrayForMap.push(i)
    }

    return (
      <div className='flex gap-5'>
        {arrayForMap.map(img => (
          <img
            key={img + "_card"} 
            src={ type == "secrets" ? "/cards/secret_front.png" : "/cards/01-card_back.png"} 
            alt="Top Discarded Card" 
            className="w-16 h-24 rounded-lg border-2 border-gray-400" 
          />
        ))}
      </div>
    )
  }

  const getNombreTurnoActual = (id) => {
    const jugador = gameState.jugadores.find(player => player.player_id == id);

    if (jugador) {
      if (jugador.name == userState.name) return "Yo";

      return (jugador.name ? jugador.name : "no name " + id)
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-x-hidden flex"
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

    {/* MAIN CONTENT AREA (Tabs) */}
    <div className="relative flex-1 min-h-screen px-4 py-3">
      {/** TAB NAVIGATE */}
      <Tabs className="w-full h-full">

        {gameState.jugadores.map((player) => (
          
          <TabPanel key={player.id} label={(player.name == userState.name ? "Yo" : player.name ) + " " + (player.is_host ? "👑" : "")}>
            {userState.id === player.player_id ? (
              <>
                {/* Secretos */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Secretos
                  </h2>
                  <Secrets />
                </div>

                {/* Mazos / Draft / Descartar */}
                <div
                  className="absolute top-1/2 left-0 w-full flex items-center justify-center gap-12 px-4"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Mazos */}
                  <div className="flex flex-col items-center">
                    <h2 className="text-white text-xl font-bold mb-4 text-center">
                      Deck
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
                      Discard
                    </h2>
                    <Discard
                      topDiscardedCard={gameState.mazos?.discard?.top ?? ''}
                      counterDiscarded={gameState.mazos?.discard?.count ?? 0}
                    />
                  </div>
                </div>

                {/* Cartas en mano */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Cartas en mano
                  </h2>
                  <HandCards
                    selectedCards={selectedCards}
                    onSelect={handleCardSelect}
                  />
                </div>
              </>
            ) : (         /*  Tab de otro jugador  */

              <div className='flex flex-col items-center gap-5'>
                
                {/* Secretos de otro jugador */}
                <div className="">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Secretos
                  </h2>

                  {printCardBacks(player.total_secrets_count, "secrets")}

                </div>

                {/* Cartas en mano */}
                <div className="">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Cartas en mano
                  </h2>
                  
                  {printCardBacks(player.hand_size, "cards")}        
                  
                </div>

                {/* Sets */}
                <div className="">
                  <OtherPlayerSets player={player} />
                </div>

              </div>
            
            )}
          </TabPanel>

        ))}

      </Tabs>
    </div>

    {/* SIDE PANEL */}
    <aside className="w-[22%] min-w-[280px] max-w-sm bg-black/60 text-white p-4 flex flex-col justify-between border-l border-white/20">
      {/* Upper info */}
      <div>
        <h2 className="text-lg font-bold mb-2">Turno Actual</h2>
        <p className="mb-4">{getNombreTurnoActual(gameState.turnoActual)}</p>
        <Log />
      </div>

      <ButtonGame
        onClick={() => setShowPlayerSets(true)}
        disabled={loading || gameState.drawAction.hasDiscarded}
      >
        Ver Sets
      </ButtonGame>

      {/* Action buttons */}
      {gameState.turnoActual == userState.id && (
        <div>
          <h2 className="text-lg font-bold mb-4">Acciones de Turno</h2>

          {/* Estado */}
          <div className="text-white text-sm mb-3 bg-black/50 px-3 py-2 rounded">
            {!gameState.drawAction.hasDiscarded && 'Descarta cartas primero'}
            {gameState.drawAction.hasDiscarded &&
              !gameState.drawAction.hasDrawn &&
              `Roba ${gameState.drawAction.cardsToDrawRemaining} carta(s)`}
            {gameState.drawAction.hasDiscarded &&
              gameState.drawAction.hasDrawn &&
              'Puedes finalizar turno'}
          </div>

          {/* Botones */}
          <div className="flex flex-col space-y-3">
            
            {(selectedCards.length === 1 ) && (
                <ButtonGame
                  onClick={handlePLayEventCard}
                  disabled={
                    loading
                  }
                >
                  Jugar Carta
                </ButtonGame>
            )}

            {( !gameState.drawAction.hasDiscarded || selectedCards.length > 0 ) && (
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
            )}
         
            {gameState.drawAction.hasDiscarded &&
              gameState.drawAction.hasDrawn &&
              selectedCards.length === 0 && (
                <ButtonGame onClick={handleFinishTurn} disabled={loading}>
                  Finalizar Turno
                </ButtonGame>
            )}
          
          </div>
        </div>
      )}
    </aside>

      {/* GAME END MODAL */}
      {gameState?.gameEnded && (
        <GameEndModal
          ganaste={gameState.ganaste}
          winners={gameState.winners}
          finish_reason={gameState.finish_reason || 'La partida ha terminado'}
        />
      )}

      {/* Modal de sets */}
      <PlayerSetsModal
        isOpen={showPlayerSets}
        onClose={() => setShowPlayerSets(false)}
        sets={playerSetsForModal} // Ajusta según la estructura de tu contexto
        selectedCards={selectedCards}
        onCardSelect={handleCardSelect}
        onCreateSet={handlePlayDetective}
      />

      {/* Modal de seleccionar jugador */}
      <SelectPlayerModal
        isOpen={isSelectPlayerOpen}
        onClose={() => setIsSelectPlayerOpen(false)}
        jugadores={gameState.jugadores || []}
        userId={userState.id}
        currentEventType={gameState.eventCards?.actionInProgress?.eventType}
        detectiveType={gameState.detectiveAction?.actionInProgress?.setType}
        anotherVictim={gameState.eventCards?.anotherVictim}
        detectiveAction={gameState.detectiveAction}
        onPlayerSelect={handlePlayerSelect}
        onConfirm={handleConfirmSelectPlayer}
        onCancel={handleCancelSelectPlayer}
      />

    </main>
  )
}
