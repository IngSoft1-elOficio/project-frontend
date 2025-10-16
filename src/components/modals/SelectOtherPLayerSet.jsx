import { useState } from 'react'
import ButtonGame from '../ButtonGame.jsx'
import { FiArchive } from 'react-icons/fi'

const SelectOtherPLayerSet = ({
  player, // --> jugador que se muestran los sets 
  sets = [], //array → lista de sets jugados
  onSelectSet, //función → callback para crear un nuevo set
}) => {

  const [selectedSet, setSelectedSet] = useState(null)

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

  const filteredSetsPerPlayer = () => {
    return sets.filter(set => set.owner_id == player.id)
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
                        <p className={emptyTitle}>No hay sets disponibles</p>
                        <p className={emptyText}>
                        Ningún jugador tiene sets de detective para seleccionar
                        </p>
                    </div>
                </div>
            ) : (
                // Caso hay sets
                <div className={setsGrid}>
                {filteredSetsPerPlayer.map((set, index) => (
                    <div key={index} className={setCard} onClick={setSelectedSet(set)}>
                    <div className={setHeader}>
                        <div>
                            <h3 className={setTitle}>Set {index + 1}</h3>
                            {set.set_type && (
                                <p className={setType}>
                                Detective #{set.set_type}
                                </p>
                            )}
                        </div>
                        <span className={setBadge}>
                        {set.count} {set.count === 1 ? 'carta' : 'cartas'}
                        </span>
                    </div>
                    
                    {/* Visual representation of card count */}
                    <div className={setCards}>
                        {Array.from({ length: set.count }).map((_, cardIndex) => (
                        <div
                            key={cardIndex}
                            className={miniCard}
                        >
                            <span className={miniCardText}>
                            Detective #{set.set_type}
                            </span>
                        </div>
                        ))}
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                        Dueño: Jugador #{set.owner_id}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
          </div>

          {/* Right Sidebar - Actions */}
          <div className={sidebar}>
            <ButtonGame
              onClick={onSelectSet(selectedSet)}
              disabled={true}
            >
              Selecionar Set
            </ButtonGame>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectOtherPLayerSet