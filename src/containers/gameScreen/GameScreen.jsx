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
import OtherPlayerSets from '../../components/game/OtherPlayerSets.jsx'
import LookIntoTheAshes from '../../components/modals/LookIntoTheAshes.jsx'
import SelectOtherPLayerSet from '../../components/modals/SelectOtherPLayerSet.jsx'
import PlayerSetsModal from '../../components/modals/PlayerSets.jsx'
import HideRevealStealSecretsModal from '../../components/modals/HideRevealStealSecrets.jsx'
import SelectPlayerModal from '../../components/modals/SelectPlayer.jsx'
import OtherPlayerSecrets from '../../components/game/OtherPLayerSecrets.jsx'


export default function GameScreen() {
  const { userState } = useUser()
  const { gameState, gameDispatch } = useGame()

  useEffect(() => {
    console.log('Game state at play game: ', gameState)
    console.log('User state at playgame: ', userState)
  }, [gameState, userState])

  useEffect(() => {
    if (!gameState.eventCards?.lookAshes?.showSelectCard) {
      setSelectedCardLookAshes(null);
    }
  }, [gameState.eventCards?.lookAshes?.showSelectCard]);

  const [selectedCards, setSelectedCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPlayerSets, setShowPlayerSets] = useState(false)
  const [selectedCardLookAshes, setSelectedCardLookAshes] = useState(null)

  const roomId = gameState?.roomId

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

      return mappedSet
    })


  const handleCardSelect = cardId => {
    setSelectedCards(prev => {
      const isSelected = prev.some(card => card.id === cardId)
      if (isSelected) {
        return prev.filter(card => card.id !== cardId)
      } else {
        const card = gameState.mano.find(c => c.id === cardId)
        return [...prev, { id: cardId, name: card?.name || '' }]
      }
    })
  }

  const handlePLayEventCard = async () => {
    console.log("Played Card Name: " + selectedCards[0]?.name)
    console.log("Played Card ID: " + selectedCards[0]?.id)
    
    if (selectedCards[0]?.name === "Look into the ashes") {
      console.log("Attempting to play Look Into The Ashes with ID: " + selectedCards[0]?.id)
      
      setLoading(true)
      setError(null)
      
      try {
        // Ensure card_id is a number (Pydantic expects int)
        const cardId = Number(selectedCards[0]?.id)
        
        if (isNaN(cardId)) {
          throw new Error("Invalid card ID")
        }
        
        const requestBody = {
          card_id: cardId
        }
        
        console.log("Request body:", JSON.stringify(requestBody))
        console.log("card_id type:", typeof cardId, "value:", cardId)
        
        const response = await fetch(
          `http://localhost:8000/api/game/${gameState.roomId}/look-into-ashes/play`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'http-user-id': userState.id.toString(), 
            },
            body: JSON.stringify(requestBody),
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Backend error response:", errorData)
          console.error("Response status:", response.status)
          console.error("Response headers:", Object.fromEntries(response.headers.entries()))
          throw new Error(getErrorMessage(response.status, errorData))
        }
        
        const data = await response.json()
        console.log('Played card successfully:', data)
        
        if (data.available_cards) {
          console.log("Available cards from discard:", data.available_cards)
        }

        gameDispatch({
          type: 'EVENT_LOOK_ASHES_PLAYED',
          payload: {
            action_id: data.action_id,
            available_cards: data.available_cards,
          },
        })
        
        setSelectedCards([])
      } catch (err) {
        console.error("Error playing Look Into The Ashes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
      
    } else if (selectedCards[0]?.name === "Another Victim") {
      console.log("Attempting to play Another Victim")
      
      setLoading(true)
      setError(null)

      // Jugar la carta y seleccionar el jugador objetivo y el set objetivo

      gameDispatch({
        type: 'EVENT_ANOTHER_VICTIM_START',
        payload: { playerId: userState.id },
      })

    } else {
      console.log("Card not implemented yet:", selectedCards[0]?.name)
      setError("Esta carta aún no está implementada")
      setTimeout(() => setError(null), 3000)
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
      const cardsWithOrder = selectedCards.map((card, index) => ({
        order: index + 1,
        card_id: card.id,
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
  const handlePlayerSelect = async (jugadorId) => {
    console.log("SELECTED PLAYER = ", jugadorId);
    
    const { actionInProgress } = gameState.eventCards;
    const currentEventType = actionInProgress?.eventType;
    
    const { current: detectiveAction } = gameState.detectiveAction;
    const detectiveSetType = detectiveAction?.setType;
    const actionId = detectiveAction?.actionId;
    
    // Caso 1: Another Victim (selecting target player for set steal)
    if (currentEventType === 'another_victim') {
      gameDispatch({
        type: 'EVENT_ANOTHER_VICTIM_SELECT_PLAYER',
        payload: jugadorId,
      });
      return;
    }
    
    // Caso 2: Detective Action - Player Selection
    if (detectiveAction && actionId) {
     
      console.log(`Selecting player ${jugadorId} for detective action ${actionId}`);
        
      // Update local state to show we're waiting
      gameDispatch({
        type: 'DETECTIVE_TARGET_CONFIRMED',
        payload: {
          targetPlayerId: jugadorId,
          targetPlayerData: jugadorId,
        },
      });

      console.log(detectiveSetType)

      // si es marple --> seleccionar secreto tamb
      if (detectiveSetType == "marple" || detectiveSetType == "poirot" || detectiveSetType == "pyne") {
        // seleccionar secreto

        gameDispatch({
          type: 'DETECTIVE_PLAYER_SELECTED',
          payload: {
            ...detectiveAction,
            targetPlayerId: jugadorId,
            needsSecret: true,
          },
        })

      } else {
        // si es otro no seleccionar secreto
        try {
          // Call backend - Step 1: Select target player
          const response = await fetch(
            `http://localhost:8000/api/game/${gameState.roomId}/detective-action`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                HTTP_USER_ID: userState.id.toString(),
              },
              body: JSON.stringify({
                actionId: actionId,
                executorId: userState.id,
                targetPlayerId: jugadorId,
                secretId: null, // null for player selection step
              }),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error:", errorData);
            throw new Error(getErrorMessage(response.status, errorData));
          }
          
          const data = await response.json();
          console.log("Target player selected successfully:", data);

          gameDispatch({
            type: 'DETECTIVE_PLAYER_SELECTED',
            payload: {
              ...detectiveAction,
              targetPlayerId: jugadorId,
              needsSecret: false,
            },
          })
          
          // Backend will emit WebSocket events:
          // - detective_target_selected (to all players)
          // - select_own_secret (to target player only)
          
        } catch (error) {
          console.error('Error selecting target player:', error);
          // Reset to player selection state on error
          gameDispatch({
            type: 'DETECTIVE_SET_SUBMITTED',
            payload: {
              ...detectiveAction,
              allowedPlayers: gameState.detectiveAction.allowedPlayers,
              secretsPool: gameState.detectiveAction.secretsPool,
            },
          });
          setError(error.message);
          setTimeout(() => setError(null), 5000);
        }
      }
    }  
  };

  // selectedCards [...prev, { id: cardId, name: card?.name || '' }]
  // cardsFromExistingSet [...prev, { id: cardId, name: card?.name || '' }]
  const handlePlayDetective = async (cardsFromExistingSet = null) => {
    console.log("cardsFromExistingSet:", cardsFromExistingSet);
    let cardsToUse = [];
    
    // Determine which cards to use
    if (cardsFromExistingSet) {
      // Use cards passed as argument (from Another Victim)
      if (Array.isArray(cardsFromExistingSet)) {
        cardsToUse = cardsFromExistingSet; // Already has { id, name } format
      } else {
        console.error("cardsFromExistingSet is not an array:", cardsFromExistingSet);
        setError("Error: formato de cartas inválido");
        setTimeout(() => setError(null), 3000);
        return;
      }
    } else {
      // Use cards from state (from manual selection)
      cardsToUse = selectedCards; // Already has { id, name } format
    }

    console.log("Cartas seleccionadas para el set:", cardsToUse);

    const minCards = {
      poirot: 3,
      marple: 3,
      satterthwaite: 2,
      pyne: 2,
      eileenbrent: 2,
      beresford: 2,
    };

    if (cardsToUse.length === 0) {
      setError("Debes seleccionar al menos una carta de detective");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const setType = detectSetType(cardsToUse); // Pass full objects
    if (!setType) {
      setError("Las cartas seleccionadas no forman un set válido");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (cardsToUse.length < minCards[setType]) {
      setError(`Set de ${setType} requiere al menos ${minCards[setType]} cartas`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if Pyne can be played (need revealed secrets from other players)
    if (setType === 'pyne') {
      const hasOtherPlayersWithRevealedSecrets = gameState.secretsFromAllPlayers?.some(
        secret => secret.player_id !== userState.id && !secret.hidden
      );
      
      if (!hasOtherPlayersWithRevealedSecrets) {
        setError("Parker Pyne requiere que otros jugadores tengan secretos revelados");
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    const hasWildcard = checkForWildcard(cardsToUse);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/play-detective-set`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            owner: userState.id,
            setType,
            cards: cardsToUse.map(card => card.id), // Send only IDs to backend
            hasWildcard,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear el set");
      }

      const data = await response.json();
      console.log("Set creado exitosamente!");
      console.log("Action ID:", data.actionId);
      console.log("Next Action:", data.nextAction);

      // Dispatch the action that prepares for player selection
      gameDispatch({
        type: 'DETECTIVE_SET_SUBMITTED',
        payload: {
          actionId: data.actionId,
          setType: setType, // Use the detected setType
          stage: 'awaiting_player_selection',
          cards: cardsToUse,
          hasWildcard: hasWildcard,
          allowedPlayers: data.nextAction.allowedPlayers || [],
          secretsPool: data.nextAction.metadata?.secretsPool || [],
        },
      });

      // Only clear selected cards if using manual selection
      if (!cardsFromExistingSet) {
        setSelectedCards([]);
      }

    } catch (err) {
      console.error("❌ Error al crear set:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSet = async (selectedSet) => {
    if (!selectedSet) {
      console.warn("No set selected");
      return;
    }

    console.log("Selected Set:", selectedSet);

    setLoading(true);
    setError(null);

    try {
      // POST to the Another Victim event endpoint
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/event/another-victim`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify({
            originalOwnerId: selectedSet.owner_id,
            setPosition: selectedSet.position,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        throw new Error(getErrorMessage(response.status, errorData));
      }

      const data = await response.json();
      console.log("Played Another Victim successfully:", data);

      // {
      //   success: true,
      //   transferredSet: {
      //     position: 1,
      //     cards: [...],
      //     newOwnerId: 45,
      //     originalOwnerId: 89
      //   }
      // }

      // si se movio el set, jugar el efecto del set 
      // en GameState.sets[] --> set:  { owner_id: int, position: int, set_type: string , … }
      // selectedSet --> { owner_id , position }
      // where selected set == set para jugar
      if (data.movedSet) {
        const cardsFromMovedSet = data.movedSet.cards.map(card => ({
          id: card.id,
          name: card.name || ''
        }));
        // cardsFromExistingSet [...prev, { id: cardId, name: card?.name || '' }]
        handlePlayDetective(cardsFromMovedSet);
        }

      gameDispatch({ type: 'EVENT_ANOTHER_VICTIM_COMPLETE' });      
      
    } catch (err) {
      console.error("❌ Error playing Another Victim:", err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  //Handler de HideRevealStealSecrets
  const handleActionOnSecret = async (selectedSecret) => {
    try {
      const actionId = gameState.detectiveAction.current?.actionId;
      const executorId = userState.id; // jugador que ejecuta
      const secretId = selectedSecret.id; // ✅ Changed from cardId to id
      const detectiveType = gameState.detectiveAction?.actionInProgress?.setType;
      const targetPlayerId = gameState.detectiveAction.actionInProgress?.targetPlayerId; // ✅ Fixed path
      
      console.log(secretId)

      let body = {};
      
      // Detectives de un solo paso (owner roba secreto)
      if (["marple", "pyne", "poirot"].includes(detectiveType)) {
        body = {
          actionId,
          executorId,
          targetPlayerId,
          secretId,
        };
      }
      
      // Detectives de dos pasos (target entrega secreto)
      if (["beresford", "satterthwaite", "eileenbrent"].includes(detectiveType)) { // ✅ Fixed string separation
        body = {
          actionId,
          executorId,
          secretId,
        };
      }
      
      console.log('Sending detective action:', body); // ✅ Added debug log
      
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/detective-action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            HTTP_USER_ID: userState.id.toString(),
          },
          body: JSON.stringify(body),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Error al ejecutar acción");
      }
      
      const data = await response.json();
      console.log("Acción detective completada", data);
      
    } catch (error) {
      console.error("Error al ejecutar acción de detective", error);
    }
  };

  // Helper: Detectar el tipo de set basado en las cartas seleccionadas
  const detectSetType = selectedCards => {
    if (selectedCards.length === 0) return null;

    // Pull real card data from gameState to validate `type` (if needed)
    const selectedCardData = gameState.mano.filter(card =>
      selectedCards.some(sel => sel.id === card.id)
    );

    const nonDetectiveCards = selectedCardData.filter(
      card => card.type !== "DETECTIVE"
    );
    if (nonDetectiveCards.length > 0) {
      console.log("⚠️ Hay cartas que no son de detective:", nonDetectiveCards);
      return null;
    }

    const nameToSetType = {
      "Hercule Poirot": "poirot",
      "Miss Marple": "marple",
      "Mr Satterthwaite": "satterthwaite",
      "Parker Pyne": "pyne",
      'Lady Eileen "Bundle" Brent': "eileenbrent",
      "Tommy Beresford": "beresford",
      "Tuppence Beresford": "beresford",
      "Harley Quin Wildcard": "wildcard",
    };

    const wildcards = selectedCards.filter(
      card => nameToSetType[card.name] === "wildcard"
    );
    const normalCards = selectedCards.filter(
      card => nameToSetType[card.name] !== "wildcard"
    );

    if (normalCards.length === 0) {
      console.log("⚠️ Solo hay comodines, no es válido");
      return null;
    }

    const uniqueTypes = [
      ...new Set(normalCards.map(card => nameToSetType[card.name])),
    ];

    if (uniqueTypes.includes("beresford")) {
      if (uniqueTypes.length === 1 && uniqueTypes[0] === "beresford") {
        return "beresford";
      } else if (uniqueTypes.length > 1) {
        console.log("⚠️ Mezclando Beresford con otros tipos");
        return null;
      }
    }

    if (uniqueTypes.length !== 1) {
      console.log("⚠️ Cartas de diferentes tipos:", uniqueTypes);
      return null;
    }

    return uniqueTypes[0];
  };


  // Helper: Verificar si hay un comodín (Harley Quin) en las cartas seleccionadas
  const checkForWildcard = selectedCards => {
    return selectedCards.some(card => card.name === "Harley Quin Wildcard");
  };

  const handleSelectCardFromAshes = async (selectedCardId) => {
    const { lookAshes } = gameState.eventCards
    
    if (!lookAshes?.actionId) {
      setError('No action ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8000/api/game/${gameState.roomId}/look-into-ashes/select`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'http-user-id': userState.id.toString(),
          },
          body: JSON.stringify({
            action_id: lookAshes.actionId,
            selected_card_id: selectedCardId,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Backend error response:", errorData)
        throw new Error(getErrorMessage(response.status, errorData))
      }

      const data = await response.json()
      console.log('Card selected successfully:', data)

      // Close the modal and reset the state
      gameDispatch({
        type: 'EVENT_LOOK_ASHES_COMPLETE',
      })

    } catch (err) {
      console.error("Error selecting card from ashes:", err)
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

              <div className='flex flex-col items-center gap-5 overflow-y-auto h-96'>
                
                {/* Secretos de otro jugador */}
                <div className="">
                  <h2 className="text-white text-xl font-bold mb-2 text-center">
                    Secretos
                  </h2>

                  <OtherPlayerSecrets player={player} />

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
        sets={playerSetsForModal} 
        selectedCards={selectedCards}
        onCardSelect={handleCardSelect}
        onCreateSet={() => handlePlayDetective()}
      />

      {gameState.eventCards?.anotherVictim?.showSelectSets && (
          <SelectOtherPLayerSet
            player={gameState.eventCards.anotherVictim.selectedPlayer}
            sets ={gameState.sets}
            onSelectSet={handleSelectSet} // agregar funcion cuando este implementada en GameScreen 
          />
        )}

      {/* Modal de seleccionar jugador */}
      { ( gameState.eventCards?.anotherVictim?.showSelectPlayer || gameState.detectiveAction?.showSelectPlayer ) && 
        (<SelectPlayerModal
          onPlayerSelect={handlePlayerSelect}
        />)
      }

      {/*Modal acción sobre secretos*/ }
      {(gameState.detectiveAction.showChooseOwnSecret || gameState.detectiveAction.showSelectSecret) && (
          <HideRevealStealSecretsModal
          isOpen={gameState.detectiveAction.showSelectSecret || gameState.detectiveAction.showChooseOwnSecret} // || gameStatedetectiveAction.showChooseOwnSecret
          detective={gameState.detectiveAction} //cambiar a gameState.detectiveAction
          onConfirm = {handleActionOnSecret}
        />
      )}

      {/* Modal de Look Into The Ashes */}
      <div>
        <LookIntoTheAshes 
          isOpen={gameState.eventCards?.lookAshes?.showSelectCard}
          availableCards={gameState.eventCards.lookAshes.availableCards}
          onSelectCard={handleSelectCardFromAshes}
        />
      </div>

    </main>
  )
}
