import React from 'react';
import './LoginScreen.css';

function LoginScreen() {
  return (
    <div className="login-container" style={{ backgroundImage: `url('project-frontend/public/main-screen-bg.jpg')` }}>
      <div className="login-form">
        <input type="input-text" placeholder="Ingresa tu nombre" />
        <input type="input-date" placeholder="Fecha de nacimiento" />
        <button class="login-button">Ingresar</button>
      </div>
    </div>
  );
}

export default LoginScreen;
