import Button from '../components/Button'
//Takes:
// - name: string with player name
// - avatar: string with image URL
// - birthdate: string with player birthdate
export default function ItemList() {
  //Container colors, size, position and style (card)
  const listColors = 'border-[#825012]'
  const listSize = 'min-w-[75%] min-h-[95%]'
  const listPosition = 'flex flex-row items-top justify-center pt-2'
  const listStyle = 'bg-black/40 rounded-xl border absolute'

  //Placeholder
  const partidas = [
    { sala: 'Sala 1', tipo: 'Publica', jugadores: '4/5' },
    { sala: 'Sala 2', tipo: 'Publica', jugadores: '2/3' },
    { sala: 'Sala 3', tipo: 'Privada', jugadores: '1/6' },
    { sala: 'Sala 3', tipo: 'Privada', jugadores: '1/6' },
  ]
  return (
    <div className={`${listSize} ${listPosition} ${listStyle} ${listColors}`}>
      <table className="w-full text-center">
        {/* Titles */}
        <thead>
          <tr className="text-white border-b border-[#B49150]">
            <th className="text-white text-2xl">Sala.....</th>
            <th className="text-white text-2xl">Tipo.....</th>
            <th className="text-white text-2xl">Jugadores</th>
          </tr>
        </thead>
        {/* Game list */}
        <tbody className="text-white text-lg">
          {partidas.map((partida, index) => (
            <tr
              key={index}
              className="border-b border-[#B49150] hover:bg-[#4a0a00]"
            >
              <td>{partida.sala}</td>
              <td>{partida.tipo}</td>
              <td>{partida.jugadores}</td>
              <td>
                <Button onClick={() => navigate('/')}>Ingresar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
