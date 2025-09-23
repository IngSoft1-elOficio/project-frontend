//Generic button component
//Takes:
// - onClick: function is executed when clicked
// - children: represent internal elements => allows render childs inside
export default function Button({ onClick, children }) {
  //Button color
  const buttonColors =
    'bg-[#3D0800] text-[#B49150] border-[#825012] hover:bg-[#640B01]'
  //Button style
  const buttonStyle = 'rounded-xl transition border-4 w-64 h-20'
  //Button text style
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
