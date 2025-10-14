import React from 'react'
import HandCards from '../HandCards.jsx'

const PlayerSetsModal = ({
  isOpen,
  onClose,
  sets = [],
  selectedCards = [],
  onCardSelect,
  onCreateSet,
}) => {
  if (!isOpen) return null

  // ========== ESTILOS ==========
  // Container principal
  const modalOverlay = 'fixed inset-0 bg-black/70 flex justify-center z-50'
  const modalContainer =
    'bg-[#1D0000] border-4 border-[#825012] rounded-xl w-full h-screen flex flex-col'

  // Header
  const headerStyle =
    'bg-[#640B01] text-[#B49150] border-b-4 border-[#825012] px-6 py-3'
  const headerText = 'text-xl font-bold'

  // Sets area
  const setsContainer = 'flex-1 p-6 overflow-y-auto'
  const setsGrid = 'grid grid-cols-1 md:grid-cols-2 gap-4'

  // Empty state
  const emptyContainer = 'flex items-center justify-center h-full'
  const emptyIcon = 'w-20 h-20 mx-auto mb-3 text-[#825012]'
  const emptyTitle = 'text-lg font-bold text-[#B49150]'
  const emptyText = 'text-sm mt-2 text-[#B49150]/60'

  // Set card
  const setCard = 'border-4 border-[#825012] bg-[#3D0800]/40 rounded-lg p-4'
  const setHeader = 'flex items-center justify-between mb-3'
  const setTitle = 'text-base font-bold text-[#B49150]'
  const setType = 'text-xs text-[#B49150]/70 mt-1'
  const setBadge =
    'px-3 py-1 bg-[#640B01] text-[#B49150] border border-[#825012] rounded-full text-xs font-semibold'
  const setCards = 'flex gap-2 flex-wrap'

  // Mini card
  const miniCard =
    'w-16 h-24 bg-[#640B01] border-2 border-[#825012] rounded flex items-center justify-center'
  const miniCardText = 'text-xs text-[#B49150] font-semibold text-center px-1'

  // Sidebar
  const sidebar =
    'w-40 bg-[#3D0800]/30 border-l-4 border-[#825012] p-4 flex flex-col gap-3'
  const button =
    'w-full py-2.5 bg-[#3D0800] text-[#B49150] border-4 border-[#825012] rounded-full font-semibold text-sm transition-colors hover:bg-[#4a0a00] hover:text-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#3D0800] disabled:hover:text-[#B49150]'
  const infoBox =
    'mt-2 p-2 bg-[#640B01]/40 border border-[#825012] rounded text-xs text-[#B49150] text-center'

  // Hand section
  const handSection = 'border-t-4 border-[#825012] bg-[#3D0800]/30 px-6 py-4'
  const handTitle = 'text-sm font-bold text-[#B49150] mb-3 text-center'

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
        {/* Top section with sets and actions */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content - Left side */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className={headerStyle}>
              <h2 className={headerText}>Sets del jugador</h2>
            </div>

            {/* Sets Area */}
            <div className={setsContainer}>
              {sets.length === 0 ? (
                // Empty State
                <div className={emptyContainer}>
                  <div className="text-center max-w-md">
                    <svg
                      className={emptyIcon}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className={emptyTitle}>No hay sets jugados</p>
                    <p className={emptyText}>
                      Selecciona cartas de detective de tu mano y presiona
                      "Crear Set" para jugar tu primer set
                    </p>
                  </div>
                </div>
              ) : (
                // Sets Grid
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
            <button onClick={onClose} className={button}>
              Volver
            </button>
            <button
              onClick={onCreateSet}
              disabled={selectedCards.length === 0}
              className={button}
            >
              Crear Set
            </button>

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
          <HandCards selectedCards={selectedCards} onSelect={onCardSelect} />
        </div>
      </div>
    </div>
  )
}

export default PlayerSetsModal
