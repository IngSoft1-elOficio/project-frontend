import ButtonJoin from '../components/ButtonJoin'
//Takes:
// - name: string with player name
// - avatar: string with image URL
// - birthdate: string with player birthdate
export default function ItemList() {
  //Container colors, size, position and style (card)
  const listColors = 'border-[#825012]'
  const listSize = 'min-w-[75%] min-h-[95%]'
  const listStyle = 'bg-black/40 rounded-xl border absolute'

  //Placeholder
  const partidas = [
    { sala: 'Sala 1', tipo: 'Publica', jugadores: '4/5' },
    { sala: 'Sala 2', tipo: 'Publica', jugadores: '2/3' },
    { sala: 'Sala 3', tipo: 'Privada', jugadores: '1/6' },
    { sala: 'Sala 4', tipo: 'Privada', jugadores: '1/6' },
    { sala: 'Sala 5', tipo: 'Publica', jugadores: '4/5' },
    { sala: 'Sala 6', tipo: 'Publica', jugadores: '2/3' },
    { sala: 'Sala 7', tipo: 'Privada', jugadores: '1/6' },
    { sala: 'Sala 8', tipo: 'Privada', jugadores: '1/6' },
    { sala: 'Sala 9', tipo: 'Publica', jugadores: '4/5' },
    { sala: 'Sala 10', tipo: 'Publica', jugadores: '2/3' },
    { sala: 'Sala 11', tipo: 'Privada', jugadores: '1/6' },
  ]
  return (
    <div className={`${listSize} ${listStyle} ${listColors}`}>
      {/* Titles */}
      <div className="grid grid-cols-4 text-center text-white text-2xl border-b border-[#B49150]">
        <div>Sala</div>
        <div>Tipo</div>
        <div>Jugadores</div>
        <div>{/* Button */}</div>
      </div>
      {/* Game list */}
      <div className="text-white text-lg max-h-[90vh] overflow-y-auto">
        {partidas.map((partida, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center text-center py-3 border-b border-[#B49150] hover:bg-white/5"
          >
            <div>{partida.sala}</div>
            <div>{partida.tipo}</div>
            <div>{partida.jugadores}</div>
            <div className="flex justify-center">
              <ButtonJoin onClick={() => navigate('/')}>Ingresar</ButtonJoin>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
