// Archivo: src/components/PlayersList.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayersList from '../components/PlayersList';  // mismo directorio

describe('PlayersList', () => {

  it('funciona con lista vacía', () => {
    const { container } = render(<PlayersList players={[]} hostId="" />);
    
    const list = container.querySelector('ul');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });
});