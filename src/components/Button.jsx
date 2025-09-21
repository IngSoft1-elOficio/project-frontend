export default function Button({ onClick, children }) {
  const buttonColors =
    'bg-[#3D0800] text-[#B49150] border-[#825012] hover:bg-[#640B01]'
  const buttonStyle = 'rounded-xl transition border-4 w-64 h-20'
  const buttonText = 'font-[Limelight] text-2xl'

  return (
    <button
      onClick={onClick}
      className={`${buttonColors} ${buttonStyle} ${buttonText}`}
    >
      {children}
    </button>
  )
}
