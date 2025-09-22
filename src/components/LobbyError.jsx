import Button from '../components/Button'

export default function LobbyError({ navigate }) {
  const elementsPosition =
    'flex flex-col justify-center items-end h-screen pe-48'
  const errorStyle =
    'font-[Limelight] text-4xl w-64 text-center text-red-600 pb-4'
  const errorMsgStyle =
    'font-[Limelight] text-4xl w-64 text-center text-white pb-8'

  return (
    <div className={`${elementsPosition}`}>
      <p className={`${errorStyle}`}>¡ERROR!</p>
      <p className={`${errorMsgStyle}`}>
        Debes iniciar sesion para acceder al lobby
      </p>
      <Button onClick={() => navigate('/ingreso')}>Ingreso</Button>
    </div>
  )
}
