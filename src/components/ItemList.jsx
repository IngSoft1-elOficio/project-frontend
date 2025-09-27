import { useNavigate } from 'react-router-dom'
import ButtonJoin from '../components/ButtonJoin'

//Function for a single lobby row with necessary data
function ItemListRow({ id, name, playersJoined, playerQty, onJoin }) {
  const RowStyle = 'items-center py-3 '
  const RowTextStyle = 'text-center'
  const RowColumns = 'grid grid-cols-3'
  const RowColors = 'border-b border-[#B49150] hover:bg-white/5'

  const buttonJoinStyle = 'flex justify-center'

  return (
    <div className={`${RowColumns} ${RowStyle} ${RowTextStyle} ${RowColors}`}>
      <div>{name}</div>
      <div>
        {playersJoined}/{playerQty}
      </div>
      <div className={`${buttonJoinStyle}`}>
        <ButtonJoin onClick={onJoin}>Ingresar</ButtonJoin>
      </div>
    </div>
  )
}

//Takes:
// - name: string with player name
// - avatar: string with image URL
// - birthdate: string with player birthdate
export default function ItemList({ partidas }) {
  const navigate = useNavigate()

  //Container colors, size, position and style (card)
  const listColors = 'border-[#825012]'
  const listSize = 'min-w-[75%] min-h-[95%]'
  const listStyle = 'bg-black/40 rounded-xl border absolute'

  //Headers
  const headersColumns = 'grid grid-cols-3'
  const headersStyle = 'border-b border-[#B49150]'
  const headersText = 'text-center text-[#B49150] text-2xl'

  //GameList
  const GameListText = 'text-white text-lg'
  const GameListStyle = 'max-h-[90vh] overflow-y-auto'

  return (
    <div className={`${listSize} ${listStyle} ${listColors}`}>
      {/* Headers */}
      <div className={`${headersColumns} ${headersStyle} ${headersText}`}>
        <div>SALA</div>
        <div>JUGADORES</div>
        <div>{/* Button */}</div>
      </div>

      {/* Game list */}
      <div className={`${GameListText} ${GameListStyle}`}>
        {partidas.map(partida => (
          <ItemListRow
            key={partida.id}
            id={partida.id}
            name={partida.name}
            playersJoined={partida.playersJoined}
            playerQty={partida.playerQty}
            onJoin={() => navigate('/')}
          />
        ))}
      </div>
    </div>
  )
}
