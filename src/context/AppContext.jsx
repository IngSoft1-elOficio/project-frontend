import { createContext, useContext, useReducer } from 'react'

// Estado inicial
const initialState = {
  // vacio por ahora
}

// Tipos de accion
export const actionTypes = {
  // Agregar luego
}

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    // Agregar casos
    default:
      return state
  }
}

// Contexts
const AppContext = createContext()
const AppDispatchContext = createContext()

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

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
