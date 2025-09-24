// Estado inicial
export const initialState = {
  usuarios: [],
  nombre: '',
  avatar: '',
  fechaNacimiento: '',
  error: '',
  user_id: ''
};

// Tipos de acción
export const actionTypes = {
  SET_NOMBRE: 'SET_NOMBRE',
  SET_AVATAR: 'SET_AVATAR',
  SET_FECHA: 'SET_FECHA',
  SET_ERROR: 'SET_ERROR',
  SET_USER_ID: 'SET_USER_ID',
  ADD_USUARIO: 'ADD_USUARIO',
  RESET: 'RESET',
};

// Reducer
export const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_NOMBRE:
      return { ...state, nombre: action.payload };
    case actionTypes.SET_AVATAR:
      return { ...state, avatar: action.payload };
    case actionTypes.SET_FECHA:
      return { ...state, fechaNacimiento: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.ADD_USUARIO:
      return { ...state, usuarios: [...state.usuarios, action.payload] };
    case actionTypes.SET_USER_ID:
      return {...state, user_id: action.payload };
    case actionTypes.RESET:
      return initialState;
    default:
      return state;
  }
};