import "../containers/LoginScreen/LoginScreen.css";
import { useNavigate } from 'react-router-dom';
import { useAppContext, useAppDispatch } from '../context/AppContext.jsx';
import { userActionTypes } from '../context/userContext';
import AvatarSelector from './AvatarSelector';

function LoginBox() {
  const navigate = useNavigate();
  const { nombre, fechaNacimiento, avatar, error, usuarios } = useAppContext();
  const { userDispatch, lobbyDispatch } = useAppDispatch();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!nombre || !fechaNacimiento || !avatar) {
      userDispatch({ type: userActionTypes.SET_ERROR, payload: 'todos los campos son obligatorios' });
      return;
    }

    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (fecha > hoy) {
      userDispatch({ type: userActionTypes.SET_ERROR, payload: 'Fecha de nacimiento incorrecta' });
      return;
    }

    const existe = usuarios.some(u => u.nombre === nombre && u.avatar === avatar);
    if (existe) {
      userDispatch({ type: userActionTypes.SET_ERROR, payload: 'Ya existe un usuario con el mismo nombre y avatar' });
      return;
    }

    const nuevoUsuario = { nombre, fechaNacimiento, avatar };
    userDispatch({ type: userActionTypes.ADD_USUARIO, payload: nuevoUsuario });
    userDispatch({ type: userActionTypes.RESET_FORM });

    lobbyDispatch({ type: lobbyActionTypes.LOGIN, payload: nuevoUsuario });

    navigate('/lobby');
  };

  return (
    <div className="screen-container">
      <div className="input-container">
        <h1>Ingresa tus datos</h1>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={nombre}
              onChange={(e) => dispatch({ type: userActionTypes.SET_NOMBRE, payload: e.target.value })}
              placeholder="Ingresar nombre"
              required
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label htmlFor="avatar">Avatar:</label>
            <AvatarSelector
              selected={avatar}
              onChange={(value) => dispatch({ type: userActionTypes.SET_AVATAR, payload: value })}
              options={[
                { value: 'avatar1', src: './public/avatar1.jpg' },
                { value: 'avatar2', src: './public/avatar2.jpg' },
                { value: 'avatar3', src: './public/avatar3.jpg' },
                { value: 'avatar4', src: './public/avatar4.jpg' },
                { value: 'avatar5', src: './public/avatar5.jpg' },
              ]}
            />
          </div>

          <div className="input-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={fechaNacimiento}
              onChange={(e) => dispatch({ type: userActionTypes.SET_FECHA, payload: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginBox;