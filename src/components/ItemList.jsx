import { useNavigate } from 'react-router-dom'
import ButtonJoin from '../components/ButtonJoin'
import { FiLogIn } from 'react-icons/fi'
import { useUser } from '../context/UserContext'
import { useGame } from '../context/GameContext'

//Function for a single lobby row with necessary data
function ItemListRow({ id, name, playersJoined, playerQty, onJoin }) {

  const { userState, userDispatch } = useUser();
  const { gameState, gameDispatch, connectToGame  } = useGame();

  const RowStyle = 'items-center py-2 '
  const RowTextStyle = 'text-center'
  const RowColumns = 'grid grid-cols-3'
  const RowColors = 'border-b border-[#B49150] hover:bg-white/5'

  const buttonJoinStyle = 'flex justify-center'
  const buttonAndIconTogether = 'flex items-center gap-2'

  const handleJoin = async () => {
    try {
        const requestData = {
          name: userState.name,
          avatar: userState.avatarPath,
          birthdate: userState.birthdate // debe estar en formato "YYYY-MM-DD"
        };

        console.log("join request", requestData);

        const response = await fetch(`http://localhost:8000/game/${id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });


      const data = await response.json();
      console.log("Response data:", data);

      const playerJoining = data.players.find(player => player.name == userState.name);
    
      userDispatch({ 
        type: 'SET_USER', 
        payload: {
          id: playerJoining.id,
          name: playerJoining.name,
          avatarPath: playerJoining.avatar, // Map avatar to avatarPath
          birthdate: playerJoining.birthdate,
          isHost: playerJoining.is_host
        }
      });
      
      gameDispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: {
          room: {
            id: data.room.id,
            name: data.room.name,
            playerQty: data.room.player_qty,
            status: data.room.status,
            hostId: data.room.host_id
          },
          players: data.players
        }
      });
      
      console.log('Connecting with gameId:', data.room.id, 'userId:', playerJoining.id);
      connectToGame(data.room.id, playerJoining.id);

      onJoin()
      
    } catch (err) {
      console.error('No se pudo verificar la sala', err)
    }
  }

  /*const handleJoin = () => {
    if (playersJoined >= playerQty) {
      alert(`La sala "${name}" está llena`)
      return
    }
    onJoin()
  }*/

  return (
    <div className={`${RowColumns} ${RowStyle} ${RowTextStyle} ${RowColors}`}>
      <div>{name}</div>
      <div>
        {playersJoined}/{playerQty}
      </div>
      <div className={`${buttonJoinStyle}`}>
        <ButtonJoin onClick={handleJoin}>
          <div className={`${buttonAndIconTogether}`}>
            <FiLogIn className="w-8 h-6" />
            <span>Ingresar</span>
          </div>
        </ButtonJoin>
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

  //Sort games by id ascending
  const sortedPartidas = [...partidas].sort((a, b) => b.id - a.id)

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
        {sortedPartidas.map(partida => (
          <ItemListRow
            key={partida.id}
            id={partida.id}
            name={partida.name}
            playersJoined={partida.playersJoined}
            playerQty={partida.playerQty}
            onJoin={() => navigate(`/game_join/${partida.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
