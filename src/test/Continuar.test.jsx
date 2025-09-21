import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Continuar from '../components/Continuar';

describe('Continuar', () => {
  it('muestra el botón', () => {
    render(
      <Continuar nombre="Partida" jugadores={2} onContinue={() => {}} setError={() => {}} />
    );
    expect(screen.getByText('Crear Partida')).toBeInTheDocument();
  });

  it('llama a onContinue si nombre y jugadores son válidos', () => {
    const onContinue = vi.fn();
    const setError = vi.fn();
    render(
      <Continuar nombre="Partida" jugadores={2} onContinue={onContinue} setError={setError} />
    );
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(setError).toHaveBeenCalledWith('');
    expect(onContinue).toHaveBeenCalled();
  });

  it('setea error si el nombre está vacío', () => {
    const onContinue = vi.fn();
    const setError = vi.fn();
    render(<Continuar nombre="" jugadores={2} onContinue={onContinue} setError={setError} />);
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(setError).toHaveBeenCalledWith("El nombre de la partida no puede estar vacío");
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('setea error si no hay jugadores seleccionados', () => {
    const onContinue = vi.fn();
    const setError = vi.fn();
    render(
      <Continuar nombre="Partida" jugadores={null} onContinue={onContinue} setError={setError} />
    );
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(setError).toHaveBeenCalledWith("Selecciona la cantidad de jugadores");
    expect(onContinue).not.toHaveBeenCalled();
  });
});
