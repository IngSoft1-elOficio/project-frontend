import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Continuar from '../components/Continuar';

describe('Continuar', () => {
  it('muestra el botón', () => {
    render(<Continuar nombre="Partida" jugadores={2} onContinue={() => {}} />);
    expect(screen.getByText('Crear Partida')).toBeInTheDocument();
  });

  it('llama a onContinue si nombre y jugadores son válidos', () => {
    const onContinue = vi.fn();
    render(<Continuar nombre="Partida" jugadores={2} onContinue={onContinue} />);
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(onContinue).toHaveBeenCalled();
  });

  it('muestra alerta si el nombre está vacío', () => {
    window.alert = vi.fn(); // Mock alert
    const onContinue = vi.fn();
    render(<Continuar nombre="" jugadores={2} onContinue={onContinue} />);
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(window.alert).toHaveBeenCalledWith("El nombre de la partida no puede estar vacío");
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('muestra alerta si no hay jugadores seleccionados', () => {
    window.alert = vi.fn(); // Mock alert
    const onContinue = vi.fn();
    render(<Continuar nombre="Partida" jugadores={null} onContinue={onContinue} />);
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(window.alert).toHaveBeenCalledWith("Selecciona la cantidad de jugadores");
    expect(onContinue).not.toHaveBeenCalled();
  });
});
