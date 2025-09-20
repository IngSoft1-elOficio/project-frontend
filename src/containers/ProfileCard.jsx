export default function ProfileCard({ name, avatar, birthdate }) {
  return (
    <div className="bg-white/20 rounded-xl shadow-lg p-6 flex flex-col items-center gap-4 w-72">
      <img src={avatar} alt={name} className="w-24 h-24 rounded-full" />
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-500">Fecha de nacimiento: {birthdate}</p>
    </div>
  )
}
