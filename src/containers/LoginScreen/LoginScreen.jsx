import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from "../../components/LoginBox";


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
      setError('todos los campos son obligatorios');
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
    <Login />
  );
}

export default LoginScreen;