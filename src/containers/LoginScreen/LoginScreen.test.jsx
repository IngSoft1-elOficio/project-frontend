import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginScreen from './LoginScreen.jsx';
import { expect, describe, test } from 'vitest';

// Helper para simular navegación
function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/lobby" element={<div>Lobby</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginScreen', () => {
  test('renderiza los inputs de nombre, avatar y fecha', () => {
    renderWithRouter(<LoginScreen />);
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/avatar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  test('muestra error si falta algún campo', () => {
    renderWithRouter(<LoginScreen />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument();
  });

  test('muestra error si la fecha de nacimiento es futura', () => {
    renderWithRouter(<LoginScreen />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), {
      target: { value: '3000-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/la fecha de nacimiento no puede ser futura/i)).toBeInTheDocument();
  });

  test('redirige al lobby si los datos son válidos', () => {
    renderWithRouter(<LoginScreen />);
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), {
      target: { value: '2000-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(screen.getByText(/lobby/i)).toBeInTheDocument();
  });

  test('no permite duplicar nombre y avatar', () => {
    renderWithRouter(<LoginScreen />);
    // Primer ingreso
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), {
      target: { value: '2000-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/ i }));

    // Segundo ingreso con mismo nombre y avatar
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Lucas' } });
    fireEvent.change(screen.getByLabelText(/avatar/i), { target: { value: 'avatar1' } });
    fireEvent.change(screen.getByLabelText(/fecha de nacimiento/i), {
      target: { value: '2000-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(screen.getByText(/ya existe un usuario con el mismo nombre y avatar/i)).toBeInTheDocument();
  });
});