import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Deck from '../components/Deck.jsx';

// Mock de la imagen card_back
vi.mock('../assets/01-card_back.png', () => ({
  default: 'mocked-card-back.png'
}));

describe('Deck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Renderiza mazo regular con contador correcto', () => {
    render(<Deck cardsLeft={25} />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', 'mocked-card-back.png');
    expect(cardImage).toHaveClass('w-16', 'h-24', 'rounded-lg', 'border-2', 'border-gray-400');
    
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('Renderiza mazo regular con contador en cero', () => {
    render(<Deck cardsLeft={0} />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', 'mocked-card-back.png');
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('Renderiza correctamente con diferentes cantidades de cartas', () => {
    const { rerender } = render(<Deck cardsLeft={50} />);
    expect(screen.getByText('50')).toBeInTheDocument();

    rerender(<Deck cardsLeft={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('Maneja prop cardsLeft undefined', () => {
    render(<Deck />);
    
    const cardImage = screen.getByAltText('Top Discarded Card');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', 'mocked-card-back.png');
  });

});


// TEST DE INTEGRACIÓN - Verifica que el componente recibe datos correctos del contexto
describe('Deck - Integration with GameContext', () => {
  it('recibe datos del contexto y simula actualización desde WebSocket', () => {
    // Simula props que vendrían del contexto
    const initialProps = { cardsLeft: 30 };
    const updatedProps = { cardsLeft: 25 }; 
    
    const { rerender } = render(<Deck {...initialProps} />);
    
    expect(screen.getByText('30')).toBeInTheDocument();
    rerender(<Deck {...updatedProps} />);
    
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.queryByText('30')).not.toBeInTheDocument();
  });
});