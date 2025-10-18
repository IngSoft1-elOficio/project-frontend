import { render, screen, fireEvent } from '@testing-library/react';
import LookIntoTheAshes from '../components/modals/LookIntoTheAshes';
import { vi } from 'vitest';

describe('LookIntoTheAshes', () => {
  const mockCards = [
    { id_card: 'C1', name: 'Look Into The Ashes' },
    { id_card: 'C2', name: 'Another Victim' },
    { id_card: 'C3', name: 'Card Trade' },
  ];

  const defaultProps = {
    isOpen: true,
    discardedCards: mockCards,
    selectedCard: null,
    setSelectedCard: vi.fn(),
    handleCardSelect: vi.fn(),
    isLoading: false,
  };

  const renderModal = (props = {}) =>
    render(<LookIntoTheAshes {...defaultProps} {...props} />);

  it('no se renderiza si isOpen es false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByText('Look Into The Ashes')).toBeNull();
  });

  it('renderiza modal y cartas cuando isOpen es true', () => {
    renderModal();
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
    expect(screen.getByText('Agrega una carta a tu mano')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(mockCards.length);
  });

  it('llama setSelectedCard al clickear una carta', () => {
    const setSelectedCard = vi.fn();
    renderModal({ setSelectedCard });
    const imgs = screen.getAllByRole('img');
    fireEvent.click(imgs[1].parentElement);
    expect(setSelectedCard).toHaveBeenCalledWith('C2');
  });

  it('llama handleCardSelect al clickear Seleccionar con seleccion', () => {
    const handleCardSelect = vi.fn();
    renderModal({ selectedCard: 'C1', handleCardSelect });
    fireEvent.click(screen.getByText('Seleccionar'));
    expect(handleCardSelect).toHaveBeenCalledWith('C1');
  });

  it('deshabilita el boton si no hay seleccion', () => {
    renderModal({ selectedCard: null, isLoading: false });
    expect(screen.getByText('Seleccionar')).toBeDisabled();
  });

  it('deshabilita el boton si esta cargando', () => {
    renderModal({ selectedCard: 'C1', isLoading: true });
    const loadingButton = screen.getByText('Seleccionar');
    expect(loadingButton).toBeDisabled();
    expect(loadingButton.textContent).toMatch(/Enviando|Seleccionar/);
  });

  it('no rompe si discardedCards es undefined', () => {
    renderModal({ discardedCards: undefined });
    expect(screen.getByText('Look Into The Ashes')).toBeInTheDocument();
  });
});
