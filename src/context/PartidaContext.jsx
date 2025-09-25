import { createContext, useContext, useReducer } from "react";

// Estado inicial
const initialState = {
  nombre_partida: "",
  jugadores: null,
};

// Tipos de acción
export const actionTypes = {
  SET_NOMBRE_PARTIDA: "SET_NOMBRE_PARTIDA",
  SET_JUGADORES: "SET_JUGADORES",
  RESET_PARTIDA: "RESET_PARTIDA",
};

// Reducer
const partidaReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_NOMBRE_PARTIDA:
      return { ...state, nombre_partida: action.payload };
    case actionTypes.SET_JUGADORES:
      return { ...state, jugadores: action.payload };
    case actionTypes.RESET_PARTIDA:
      return initialState;
    default:
      return state;
  }
};

// Contexts
const PartidaContext = createContext();
const PartidaDispatchContext = createContext();

// Provider
export const PartidaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(partidaReducer, initialState);

  return (
    <PartidaContext.Provider value={state}>
      <PartidaDispatchContext.Provider value={dispatch}>
        {children}
      </PartidaDispatchContext.Provider>
    </PartidaContext.Provider>
  );
};

// Hooks
export const usePartidaContext = () => {
  const context = useContext(PartidaContext);
  if (context === undefined) {
    throw new Error("usePartidaContext must be used within a PartidaProvider");
  }
  return context;
};

export const usePartidaDispatch = () => {
  const context = useContext(PartidaDispatchContext);
  if (context === undefined) {
    throw new Error("usePartidaDispatch must be used within a PartidaProvider");
  }
  return context;
};
