import React from 'react'
import HandCards from '../HandCards.jsx'
import ButtonGame from '../ButtonGame.jsx'
import { FiArchive } from 'react-icons/fi'

const PlayerSetsModal = ({
  isOpen, //bool → indica si el modal está visible
  onClose, //función → cierra el modal
  sets = [], //array → lista de sets jugados
  selectedCards = [], //array → cartas actualmente seleccionadas
  onCardSelect, //función → callback al seleccionar/deseleccionar una carta
  onCreateSet, //función → callback para crear un nuevo set
}) => {
  if (!isOpen) return null //no renderizar nada si el modal esta cerrado

  // ========== ESTILOS ==========
  // Container principal -> Todo
  const modalOverlay = 'fixed inset-0 flex z-50'
  const modalContainer =
    'bg-[#1D0000] border-4 border-[#825012] rounded-2xl w-full h-screen flex flex-col'

  // Header
  const headerStyle =
    'bg-[#640B01] text-[#B49150] border-b-4 border-[#825012] px-6 py-3'
  const headerText = 'text-2xl font-bold'

  // Contenedor de sets (todos)
  const setsContainer = 'p-6 overflow-y-auto' // Overflow es para el scroll
  const setsGrid = 'grid grid-cols-1 md:grid-cols-2 gap-4'

  // Caso sin sets
  const emptyContainer = 'flex items-center justify-center h-full'
  const emptyIcon = 'w-20 h-20 mx-auto mb-3 text-[#825012]'
  const emptyTitle = 'text-xl font-bold text-[#B49150]'
  const emptyText = 'text-base mt-2 text-[#B49150]/60'

  // Contenedor de cartas (un set)
  const setCard = 'border-4 border-[#825012] bg-[#3D0800]/40 rounded-2xl p-4'
  const setHeader = 'flex items-center justify-between mb-2'
  const setTitle = 'text-lg font-bold text-[#B49150]'
  const setType = 'text-base text-[#B49150]/70'
  const setBadge =
    'px-3 py-1 bg-[#640B01] text-[#B49150] border border-[#825012] rounded-full text-xs font-semibold'
  const setCards = 'flex gap-2 flex-wrap'

  // Cartas (cambiar cuando se traigan las cartas reales)
  const miniCard =
    'w-16 h-24 bg-[#640B01] border-2 border-[#825012] rounded flex items-center justify-center'
  const miniCardText = 'text-xs text-[#B49150] font-semibold text-center px-1'

  // Sidebar derecha
  const sidebar =
    'w-40 bg-[#3D0800]/30 border-l-4 border-[#825012] p-4 flex flex-col gap-3'
  const infoBox =
    'mt-2 p-2 bg-[#640B01]/40 border border-[#825012] rounded-lg text-sm text-[#B49150] text-center'

  // Mano
  const handSection =
    'border-t-4 border-[#825012] bg-[#3D0800]/30 px-6 py-4 pb-6'
  const handTitle = 'text-base font-bold text-[#B49150] mb-3 text-center'

  // ========== FUNCIONES ==========
  const getSetTypeName = setType => {
    const typeNames = {
      poirot: 'Poirot',
      marple: 'Miss Marple',
      satterthwaite: 'Satterthwaite',
      eileenbrent: 'Eileen Brent',
      beresford: 'Hermanos Beresford',
      pyne: 'Parker Pyne',
    }
    return typeNames[setType] || 'Detective'
  }

  // ========== RENDER ==========
  return (
    <div className={modalOverlay}>
      <div className={modalContainer}>
        {/* Seccion superior*/}
        <div className="flex flex-1 overflow-hidden">
          {/* Lado izquierdo */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className={headerStyle}>
              <h2 className={headerText}>Sets del jugador</h2>
            </div>

            {/* Contenedor de sets */}
            <div className={setsContainer}>
              {sets.length === 0 ? (
                // Caso vacio
                <div className={emptyContainer}>
                  <div className="text-center max-w-md">
                    <FiArchive className={emptyIcon} />
                    <p className={emptyTitle}>No tenes sets</p>
                    <p className={emptyText}>
                      Selecciona cartas de detective de tu mano y presiona
                      "Crear Set" para jugar tu primer set
                    </p>
                  </div>
                </div>
              ) : (
                // Caso hay sets
                <div className={setsGrid}>
                  {sets.map((set, index) => (
                    <div key={set.id || index} className={setCard}>
                      <div className={setHeader}>
                        <div>
                          <h3 className={setTitle}>Set {index + 1}</h3>
                          {set.setType && (
                            <p className={setType}>
                              {getSetTypeName(set.setType)}
                            </p>
                          )}
                        </div>
                        <span className={setBadge}>Jugado</span>
                      </div>
                      {/* Cambiar cuando se traigan las cartas reales */}
                      <div className={setCards}>
                        {set.cards &&
                          set.cards.map((card, cardIndex) => (
                            <div
                              key={card.id || cardIndex}
                              className={miniCard}
                            >
                              <span className={miniCardText}>
                                {card.name ||
                                  card.cardType ||
                                  `C${cardIndex + 1}`}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Actions */}
          <div className={sidebar}>
            <ButtonGame onClick={onClose}>Volver</ButtonGame>
            <ButtonGame
              onClick={onCreateSet}
              disabled={selectedCards.length === 0}
            >
              Crear Set
            </ButtonGame>

            {/* Info adicional */}
            {selectedCards.length > 0 && (
              <div className={infoBox}>
                {selectedCards.length} carta
                {selectedCards.length !== 1 ? 's' : ''} seleccionada
                {selectedCards.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - Player Hand */}
        <div className={handSection}>
          <h3 className={handTitle}>
            Cartas en tu mano - Selecciona cartas de detective para crear un set
          </h3>
          <div className="flex justify-center w-full">
            <HandCards selectedCards={selectedCards} onSelect={onCardSelect} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerSetsModal
