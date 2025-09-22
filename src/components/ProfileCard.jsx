export default function ProfileCard({ name, avatar, birthdate }) {
  //if (!name && !avatar && !birthdate) {
  //  return null
  //}

  const cardColors = 'border-[#825012]'
  const cardSize = 'w-64 h-64'
  const cardPosition = 'flex flex-col items-center justify-center p-6 gap-2'
  const cardStyle = 'bg-black/40 rounded-xl border'

  const imageSize = 'w-40 h-40'
  const imageStyle = 'rounded-full border-4'
  const imageColor = 'border-[#825012]'

  const textStyle = 'text-lg font-bold text-[#B49150]'

  const dateStyle = 'text-center text-sm text-gray-300'
  return (
    <div className={`${cardSize} ${cardPosition} ${cardStyle} ${cardColors}`}>
      <img
        src={avatar}
        alt={name}
        className={`${imageSize} ${imageStyle} ${imageColor}`}
      />
      <h2 className={`${textStyle}`}>{name}</h2>
      <p className={`${dateStyle}`}>Fecha de nacimiento: {birthdate}</p>
    </div>
  )
}
