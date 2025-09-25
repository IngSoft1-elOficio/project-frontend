import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CantidadDeJugadores from '../components/CantidadDeJugadores';

describe('CantidadDeJugadores', () => {
  it('muestra el label y los botones de cantidad', () => {
    const setJugadores = vi.fn();
    render(<CantidadDeJugadores jugadores={null} setJugadores={setJugadores} />);
    expect(screen.getByText(/Cantidad de jugadores/i)).toBeInTheDocument();
    [2, 3, 4, 5, 6].forEach(num => {
      expect(screen.getByText(num)).toBeInTheDocument();
    });
  });

  it('llama a setJugadores al hacer click en un botón', () => {
    const setJugadores = vi.fn();
    render(<CantidadDeJugadores jugadores={null} setJugadores={setJugadores} />);
    fireEvent.click(screen.getByText('4'));
    expect(setJugadores).toHaveBeenCalledWith(4);
  });

  it('el botón seleccionado tiene la clase activa', () => {
    const setJugadores = vi.fn();
    render(<CantidadDeJugadores jugadores={5} setJugadores={setJugadores} />);
    const boton = screen.getByText('5');
    expect(boton.className).toMatch(/btn-cantidad-jugador-activo/);
  });
});
