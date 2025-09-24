import { createContext, useContext, useReducer } from 'react'
import { lobbyReducer, initialLobbyState } from './userStateLobby'
import { userReducer, initialUserState } from './userContext'

// Contexts
const AppContext = createContext();
const AppDispatchContext = createContext();

// Provider
export const AppProvider = ({ children }) => {
  /* //Code to persist log of player, use this and delete const from below
  const persistedState =
    JSON.parse(localStorage.getItem('userStateLobby')) || initialState

  const [state, dispatch] = useReducer(appReducer, persistedState)

  useEffect(() => {
    localStorage.setItem('userStateLobby', JSON.stringify(state))
  }, [state])
  */
  const [userState, userDispatch] = useReducer(userReducer, initialUserState)
  const [lobbyState, lobbyDispatch] = useReducer(lobbyReducer, initialLobbyState)

  // Combinar estados y dispatchs
  const state = { userState, lobbyState }
  const dispatch = { userDispatch, lobbyDispatch }

  //console.log('[AppProvider] estado actual:', state)

  return (
    <PartidaProvider>
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
    </PartidaProvider>
  );
}

// Hooks
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
};
