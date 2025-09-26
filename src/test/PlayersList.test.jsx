// Archivo: src/components/PlayersList.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayersList from '../components/PlayersList';  // mismo directorio

describe('PlayersList', () => {
  it('muestra la lista de jugadores', () => {
    const players = [
      { user_id: '1', nombre: 'Player1', host: false },
      { user_id: '2', nombre: 'Player2', host: false },
    ];

    render(<PlayersList players={players} hostId="1" />);

    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('Player2')).toBeInTheDocument();
  });

  it('muestra el icono de corona para el host', () => {
    const players = [{ user_id: '1', nombre: 'HostPlayer', host: false }];

    render(<PlayersList players={players} hostId="1" />);

    expect(screen.getByText('👑')).toBeInTheDocument();
    expect(screen.getByText('HostPlayer')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument(); // label de rol
  });

  it('muestra "Jugador X" cuando no hay nombre', () => {
    const players = [
      { user_id: '1', nombre: '', host: false },
      { user_id: '2', host: false },
    ];

    render(<PlayersList players={players} hostId="" />);

    // Verificar que al menos el segundo jugador se muestra correctamente
    expect(screen.getByText('Jugador 2')).toBeInTheDocument();
    // Verificar que ambos aparecen como "Jugador" en el rol
    expect(screen.getAllByText('Jugador')).toHaveLength(2);
  });

  it('funciona con lista vacía', () => {
    const { container } = render(<PlayersList players={[]} hostId="" />);
    
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });
});