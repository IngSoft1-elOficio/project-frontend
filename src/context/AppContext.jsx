import { createContext, useContext, useReducer, useEffect } from 'react'
import { appReducer, initialState } from './appState'

// Contexts
const AppContext = createContext()
const AppDispatchContext = createContext()

// Provider
export const AppProvider = ({ children }) => {
  /* Code to persist log of player, use this and delete const from below
  const persistedState =
    JSON.parse(localStorage.getItem('appState')) || initialState

  const [state, dispatch] = useReducer(appReducer, persistedState)

  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state))
  }, [state])
  */
  const [state, dispatch] = useReducer(appReducer, initialState)

  console.log('[AppProvider] estado actual:', state)

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  )
}

// Hooks
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext)
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider')
  }
  return context
}
