import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginScreen.css';

function LoginScreen() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');

  const [usuarios, setUsuarios] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!nombre || !fechaNacimiento || !avatar) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    if (fecha > hoy) {
      setError('Fecha de nacimiento incorrecta');
      return;
    }

    const existe = usuarios.some(
      (u) => u.nombre === nombre && u.avatar === avatar
    );
    if (existe) {
      setError('Ya existe un usuario con el mismo nombre y avatar');
      return;
    }

    const nuevoUsuario = { nombre, fechaNacimiento, avatar };
    setUsuarios([...usuarios, nuevoUsuario]);

    setError('');
    setNombre('');
    setFechaNacimiento('');
    setAvatar('');

    navigate('/lobby');
  }

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
  );
}

export default LoginScreen;