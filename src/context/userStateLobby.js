// Estado inicial
export const initialLobbyState = {
  player: {
    name: 'Jugador',
    host: false,
    avatar: '/images/avatar_4.png',
    birthdate: '21/09/1995',
  },
}

// Tipos de acción
export const lobbyActionTypes = {
  //SET_PLAYER: 'SET_PLAYER',
  LOGOUT: 'LOGOUT',
}

// Reducer
export const lobbyReducer = (state, action) => {
  switch (action.type) {
    //case actionTypes.SET_PLAYER:
    //return { ...state, player: action.payload }
    case lobbyActionTypes.LOGOUT:
      return {
        ...state,
        player: { name: '', host: false, avatar: '', birthdate: '' },
      }
    default:
      return state
  }
}
