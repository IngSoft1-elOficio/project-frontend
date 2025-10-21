import { useUser } from "../context/UserContext"

export default function ProfileCard() {
  const { userState } = useUser()

  const cardColors = 'border-[#825012]'
  const cardSize = 'w-64 h-64'
  const cardPosition = 'flex flex-col items-center justify-center p-6 gap-2'
  const cardStyle = 'bg-black/40 rounded-xl border'
  
  const avatarSize = 'w-40 h-40'
  const avatarStyle = 'rounded-full border-4'
  const avatarColor = 'border-[#825012]'

  const nameStyle = 'text-lg font-bold text-[#B49150]'

  return (
    <div className={`${cardSize} ${cardPosition} ${cardStyle} ${cardColors}`}>
      <img
        src={userState.avatarPath || '/default-avatar.png'}
        alt={userState.name || 'Usuario'}
        className={`${avatarSize} ${avatarStyle} ${avatarColor}`}
      />
      <h2 className={`${nameStyle}`}>{userState.name || 'Usuario'}</h2>
    </div>
  )
}