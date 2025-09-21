import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NombreDePartida from '../components/NombreDePartida';

describe('NombreDePartida', () => {
  it('muestra el label y actualiza el nombre', () => {
    const setNombre = vi.fn();
    render(<NombreDePartida nombre="" setNombre={setNombre} />);
    
    // Verifica que el label esté en el documento
    expect(screen.getByText(/Nombre de la partida/i)).toBeInTheDocument();

    // Simula escribir en el input
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Partida 1' } });
    expect(setNombre).toHaveBeenCalledWith('Partida 1');
  });
});
