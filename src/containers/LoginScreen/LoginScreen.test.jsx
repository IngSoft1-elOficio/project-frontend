// LoginScreen.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginScreen from './LoginScreen';

// Mock de useNavigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('LoginScreen', () => {
  beforeEach(() => {
    navigateMock.mockClear();
  });

  it('renderiza todos los campos del formulario', () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/avatar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('muestra error si se envía el formulario con campos vacíos', async () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

  });

  it('muestra error si la fecha de nacimiento es futura', async () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), { target: { value: futureDate.toISOString().split('T')[0] } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/fecha de nacimiento incorrecta/i)).toBeInTheDocument();
    });
  });

  it('redirige al lobby si los datos son válidos', async () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), { target: { value: '2000-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/lobby');
    });
  });

  it('no permite duplicar nombre y avatar', async () => {
    render(
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    );

    // Primer ingreso
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    // Segundo ingreso con los mismos datos
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), { target: { value: '2000-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/ya existe un usuario con el mismo nombre y avatar/i)).toBeInTheDocument();
    });
  });
});
