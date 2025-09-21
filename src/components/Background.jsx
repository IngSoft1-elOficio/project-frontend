//Background with gradient color and image
export default function Background({ children }) {
  const bgImageStyle = 'bg-no-repeat bg-center bg-cover'
  const bgImageSize = 'w-screen h-screen'

  return (
    <div
      className={`${bgImageSize} ${bgImageStyle}`}
      style={{ backgroundImage: "url('images/bg_characters.jpeg')" }}
    >
      {children}
    </div>
  )
}
