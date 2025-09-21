import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PantallaDeCreacion from '../containers/PantallaDeCreacion';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('PantallaDeCreacion', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renderiza los componentes principales', () => {
    render(<PantallaDeCreacion />);
    expect(screen.getByText(/Nombre de la partida/i)).toBeInTheDocument();
    expect(screen.getByText(/Cantidad de jugadores/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Partida/i)).toBeInTheDocument();
  });

  it('muestra error si fetch falla', async () => {
    fetch.mockResolvedValue({ ok: false });
    render(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Partida Test' } });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    await waitFor(() => {
        expect(screen.getByText(/Error al crear la partida/i)).toBeInTheDocument();
    });
  });

  it('muestra error si el nombre ya existe', async () => {
    fetch.mockResolvedValue({ ok: false, status: 409 });
    render(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Partida Repetida' } });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    await waitFor(() => {
      expect(
        screen.getByText(/Ya existe una partida con ese nombre/i)
      ).toBeInTheDocument();
    });
  });
});
