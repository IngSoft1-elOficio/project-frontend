import { render, screen, fireEvent } from '@testing-library/react';
import LookIntoTheAshes from '../components/modals/LookIntoTheAshes';
import { vi } from 'vitest';

describe('LookIntoTheAshes', () => {
  const mockCards = [
    { id_card: 'C1', name: 'Look Into The Ashes' },
    { id_card: 'C2', name: 'Another Victim' },
    { id_card: 'C3', name: 'Card Trade' },
  ];

  it('does not render if isOpen is false', () => {
    render(
      <LookIntoTheAshes
        isOpen={false}
        onClose={vi.fn()}
        discardedCards={mockCards}
        selectedCardLookAshes={null}
        setSelectedCardLookAshes={vi.fn()}
        handleCardSelect={vi.fn()}
      />
    );
    expect(screen.queryByText('Look Into The Ashes')).toBeNull();
  });

  it('renders modal and cards when isOpen is true', () => {
    render(
      <LookIntoTheAshes
        isOpen={true}
        onClose={vi.fn()}
        discardedCards={mockCards}
        selectedCardLookAshes={null}
        setSelectedCardLookAshes={vi.fn()}
        handleCardSelect={vi.fn()}
      />
    );
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
    expect(screen.getByText('Agrega una carta a tu mano')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBe(mockCards.length);
  });

  it('calls setSelectedCardLookAshes when a card is clicked', () => {
    const setSelectedCardLookAshes = vi.fn();
    render(
      <LookIntoTheAshes
        isOpen={true}
        onClose={vi.fn()}
        discardedCards={mockCards}
        selectedCardLookAshes={null}
        setSelectedCardLookAshes={setSelectedCardLookAshes}
        handleCardSelect={vi.fn()}
      />
    );
    const cardDivs = screen.getAllByRole('img');
    fireEvent.click(cardDivs[1]);
    fireEvent.click(cardDivs[1].parentElement);
    expect(setSelectedCardLookAshes).toHaveBeenCalledWith('C2');
  });

  it('calls handleCardSelect and onClose when Seleccionar is clicked', () => {
    const handleCardSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <LookIntoTheAshes
        isOpen={true}
        onClose={onClose}
        discardedCards={mockCards}
        selectedCardLookAshes={'C1'}
        setSelectedCardLookAshes={vi.fn()}
        handleCardSelect={handleCardSelect}
      />
    );
    const selectButton = screen.getByText('Seleccionar');
    fireEvent.click(selectButton);
    expect(handleCardSelect).toHaveBeenCalledWith('C1');
    expect(onClose).toHaveBeenCalled();
  });

  it('button Seleccionar is disabled if no card is selected', () => {
    render(
      <LookIntoTheAshes
        isOpen={true}
        onClose={vi.fn()}
        discardedCards={mockCards}
        selectedCardLookAshes={null}
        setSelectedCardLookAshes={vi.fn()}
        handleCardSelect={vi.fn()}
      />
    );
    const selectButton = screen.getByText('Seleccionar');
    expect(selectButton).toBeDisabled();
  });
});
