import '../../index.css'
import { useUser } from '../../context/UserContext.jsx'
import { useGame } from '../../context/GameContext.jsx'
import { useState } from 'react'
import Deck from '../../components/Deck.jsx'
import Discard from '../../components/Discard.jsx'
import GameEndModal from '../../components/GameEndModal'
import HandCards from '../../components/HandCards.jsx'
import Secrets from '../../components/Secrets.jsx'
import { useEffect } from 'react'
import ButtonGame from '../../components/ButtonGame.jsx'
import Draft from '../../components/game/Draft.jsx'
import Tabs from '../../components/game/Tabs.jsx'
import TabPanel from '../../components/game/TabPanel.jsx'
import Log from '../../components/game/Log.jsx'
import { OtherPlayerSets } from '../../components/game/OtherPlayerSets.jsx'

export default function GameScreen() {
  const { userState } = useUser()
  const { gameState } = useGame()

  useEffect(() => {
    console.log('Game state at play game: ', gameState)
    console.log('User state at playgame: ', userState)
  }, [gameState, userState])

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

  const handleDraft = async (cardId) => {
    try {
      const response = await fetch(`http://localhost:8000/game/${gameState.gameId}/draft/pick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'HTTP_USER_ID': userState.id.toString()
        },
        body: JSON.stringify({
          card_id: cardId,
          user_id: userState.id
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
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-[100]">
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

      <div>
        <ButtonGame onClick={() => { return true}} disabled={loading}>Ves Sets Propios</ButtonGame>
      </div>

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
            { ( !gameState.drawAction.hasDiscarded || selectedCards.length > 0 ) && (
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
  </main>
  )
}
