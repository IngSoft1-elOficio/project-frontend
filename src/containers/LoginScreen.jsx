import React from 'react';
import './LoginScreen.css';

function LoginScreen() {
  return (
    <div className="login-container" style={{ backgroundImage: `url('/main-screen-bg.jpg')` }}>
      <div className="login-form">
        <
        <input type="text" placeholder="Ingresa tu nombre" />
        <input type="date" placeholder="Fecha de nacimiento" />
        <button className="login-button">Ingresar</button>
      </div>
    </div>
  );
}

export default LoginScreen;
