// Estado inicial
export const initialState = {
  player: {
    name: 'Jugador',
    avatar: '/images/avatar_4.png',
    birthdate: '21/09/1995',
  },
}

// Tipos de acción
export const actionTypes = {
  //SET_PLAYER: 'SET_PLAYER',
  LOGOUT: 'LOGOUT',
}

// Reducer
export const appReducer = (state, action) => {
  switch (action.type) {
    //case actionTypes.SET_PLAYER:
    //return { ...state, player: action.payload }
    case actionTypes.LOGOUT:
      return { ...state, player: { name: '', avatar: '', birthdate: '' } }
    default:
      return state
  }
}
