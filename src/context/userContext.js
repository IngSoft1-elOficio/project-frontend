// Estado inicial
export const initialUserState = {
  usuarios: [],
  nombre: '',
  avatar: '',
  fechaNacimiento: '',
  error: '',
};

// Tipos de acción
export const userActionTypes = {
  SET_NOMBRE: 'SET_NOMBRE',
  SET_AVATAR: 'SET_AVATAR',
  SET_FECHA: 'SET_FECHA',
  SET_ERROR: 'SET_ERROR',
  ADD_USUARIO: 'ADD_USUARIO',
  RESET: 'RESET',
};

// Reducer
export const userReducer = (state, action) => {
  switch (action.type) {
    case userActionTypes.SET_NOMBRE:
      return { ...state, nombre: action.payload };
    case userActionTypes.SET_AVATAR:
      return { ...state, avatar: action.payload };
    case userActionTypes.SET_FECHA:
      return { ...state, fechaNacimiento: action.payload };
    case userActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case userActionTypes.ADD_USUARIO:
      return { ...state, usuarios: [...state.usuarios, action.payload] };
    case userActionTypes.RESET:
      return {
        ...state,
        nombre: '',
        avatar: '',
        fechaNacimiento: '',
        error: '',
      };
    default:
      return state;
  }
};
