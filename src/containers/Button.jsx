export default function Button({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-20 py-5 rounded-lg font-semibold transition bg-[#3D0800] hover:bg-[#3D0800] text-[#B49150] border-[#825012] border-4"
    >
      {children}
    </button>
  )
}
