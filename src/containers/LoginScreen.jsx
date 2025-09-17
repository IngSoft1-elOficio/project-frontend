import React, { useState } from 'react';
import './LoginScreen.css';


function LoginScreen() {

  const [nombre, setNombre] = useState('');

  const [fechaNacimiento, setFechaNacimiento] = useState('');
  
  // Ejecuta cuando se mandan los datos
  function handleSubmit(event){
    event.preventDefault(); // Previene el comportamiento por defecto de los inputs

    console.log(nombre);
    console.log(fechaNacimiento);
  }

  function handleNombre(event) {
    setNombre(event.target.value);
  }

  function handleFechaNacimiento(event) {
    setFechaNacimiento(event.target.value);
  }

  return (
    <div className="screen-container">
      <div className="input-container">
        <h1>Ingresa tus datos</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre: </label>
            <input 
              type="text" 
              id="nombre" 
              value={nombre}
              onChange={handleNombre}
              required
              placeholder="Ingresar nombre" />
          </div>
          <div className="input-goup">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento: </label>
            <input 
              type="date"
              id="fechaNacimiento"
              value={fechaNacimiento}
              onChange={handleFechaNacimiento}
              required />
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
