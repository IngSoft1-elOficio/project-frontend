import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PantallaDeCreacion from '../containers/PantallaDeCreacion';
import { GameProvider } from '../context/GameContext';
import { UserProvider } from '../context/UserContext';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

const renderWithContext = (ui) => {
  return render(
    <UserProvider>
      <GameProvider>{ui}</GameProvider>
    </UserProvider>
  );
};

describe('PantallaDeCreacion', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renderiza los componentes principales', () => {
    renderWithContext(<PantallaDeCreacion />);
    expect(screen.getByText(/Nombre de la partida/i)).toBeInTheDocument();
    expect(screen.getByText(/Cantidad de jugadores/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear Partida/i)).toBeInTheDocument();
  });

  it('muestra error si fetch falla', async () => {
    fetch.mockResolvedValue({ ok: false });
    renderWithContext(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Partida Test' },
    });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    await waitFor(() => {
      expect(
        screen.getByText(/Error al crear la partida/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra error si el nombre ya existe', async () => {
    fetch.mockResolvedValue({ ok: false, status: 409 });
    renderWithContext(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Partida Repetida' },
    });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    await waitFor(() => {
      expect(
        screen.getByText(/Ya existe una partida con ese nombre/i)
      ).toBeInTheDocument();
    });
  });

  it('muestra error si el nombre de la partida tiene más de 20 caracteres', async () => {
    renderWithContext(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'abcdefghijklmnopqrstu' }, // 21 chars
    });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(
      await screen.findByText(/no puede tener más de 20 caracteres/i)
    ).toBeInTheDocument();
  });

  it('muestra error si el nombre de la partida tiene caracteres especiales', async () => {
    renderWithContext(<PantallaDeCreacion />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Partida$%' },
    });
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('Crear Partida'));
    expect(
      await screen.findByText(/solo puede contener letras, números y espacios/i)
    ).toBeInTheDocument();
  });
});
