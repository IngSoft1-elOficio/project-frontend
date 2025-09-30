import "../index.css"
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import LobbyContent from '../components/LobbyContent';
import LobbyError from '../components/LobbyError';
import Background from '../components/Background';
import { useEffect } from "react";
import { useGame } from "../context/GameContext.jsx";

function LobbyScreen() {
  const navigate = useNavigate();
  const { userState, userDispatch } = useUser();
  const { gameState } = useGame()

  useEffect(() => {
        console.log("Game state at lobby: ", gameState);
        console.log("User state at lobby: ", userState);
    }, [gameState, userState])

  // Logout: clear user data from UserContext
  const handleLogout = () => {
    userDispatch({ type: 'CLEAR_USER' });
    navigate('/');
  };

  // Condition to be logged - check if user has required data
  const isLoggedIn = 
    userState.name !== '' && 
    userState.avatarPath !== '' && 
    userState.birthdate !== '';

  // Create player object for compatibility with existing LobbyContent component
  const player = {
    name: userState.name,
    avatar: userState.avatarPath,
    birthdate: userState.birthdate,
    isHost: userState.isHost
  };

  console.log(userState);

  // If player logged shows buttons with player data
  // if not then shows an error message with a button to "login"
  return (
    <div>
      <Background>
        {isLoggedIn ? (
          <LobbyContent
            player={player}
            handleLogout={handleLogout}
            navigate={navigate}
          />
        ) : (
          <LobbyError navigate={navigate} />
        )}
      </Background>
    </div>
  );
}

export default LobbyScreen;