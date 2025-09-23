import "../containers/LoginScreen/LoginScreen.css";
import '../index.css';

function Login({error, nombre, setNombre, avatar, handleSubmit,fechaNacimiento, setFechaNacimiento}) {
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
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresar nombre"
              required
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label htmlFor="avatar">Avatar:</label>
            <select
              id="avatar"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              required
            >
              <option value="" disabled>
                Seleccioná un avatar
              </option>
              {/* Agregar mas en el futuro */}
              <option value="avatar1">Avatar 1</option>
              <option value="avatar2">Avatar 2</option>
              <option value="avatar3">Avatar 3</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login;