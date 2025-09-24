import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NombreDePartida from '../components/NombreDePartida';

describe('NombreDePartida', () => {
  it('muestra el label y actualiza el nombre y limpia el error', () => {
    const setNombrePartida = vi.fn();
    const setError = vi.fn();
    render(<NombreDePartida nombre_partida="" setNombrePartida={setNombrePartida} setError={setError} />);
    
    expect(screen.getByText(/Nombre de la partida/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Partida 1' } });
    expect(setNombrePartida).toHaveBeenCalledWith('Partida 1');
    expect(setError).toHaveBeenCalledWith('');
  });
});
