import { useUser } from "../../context/UserContext.jsx";
import ProfileCard from "../../components/ProfileCard";

export default function ProfileContainer() {
  const { userState } = useUser();

  return (
    <main 
      className="relative min-h-dvh overflow-x-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="relative z-10 mx-auto px-4 py-10">
        <ProfileCard
          name={userState.name}
          host={userState.isHost}
          avatar={userState.avatarPath}
          birthdate={userState.birthdate}
        />
      </div>

      {/* Aca se renderixan los masos, secretos y cartas */}
    </main>
  );
}