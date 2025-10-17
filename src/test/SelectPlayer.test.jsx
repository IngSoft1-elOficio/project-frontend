import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from "vitest";
import SelectPlayerModal from "../components/modals/SelectPlayer";

describe("SelectPlayerModal", () => {
  const jugadoresMock = [
    { id: 1, name: "Lucas", avatar: "avatar1.png", birthdate: "2000-01-01" },
    { id: 2, name: "María", avatar: "avatar2.png", birthdate: "1995-03-05" },
    { id: 3, name: "Juan", avatar: "avatar3.png", birthdate: "1992-07-10" },
  ];

  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    jugadores: jugadoresMock,
    userId: 1,
    currentEventType: null,
    detectiveType: null,
    anotherVictim: {},
    detectiveAction: {},
    onPlayerSelect: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("no renderiza si isOpen es false", () => {
    render(<SelectPlayerModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText(/Confirmar/i)).toBeNull();
  });

  it("muestra jugadores excepto el usuario actual", () => {
    render(<SelectPlayerModal {...baseProps} currentEventType="another_victim" />);
    const cards = screen.getAllByText(/María|Juan/);
    expect(cards.length).toBe(2);
    expect(screen.queryByText("Lucas")).toBeNull();
  });

  it("muestra mensaje correcto para another_victim sin selección", () => {
    render(<SelectPlayerModal {...baseProps} currentEventType="another_victim" />);
    expect(screen.getByText(/Selecciona un jugador para robar su set/i)).toBeInTheDocument();
  });

  it("resalta jugador seleccionado", () => {
    const props = {
      ...baseProps,
      currentEventType: "another_victim",
      anotherVictim: { selectedPlayer: jugadoresMock[1] },
    };
    render(<SelectPlayerModal {...props} />);
    const selected = screen.getByText("María");
    expect(selected.closest("div").className).toMatch(/ring-\[#FFD700\]/);
  });

  it("llama a onPlayerSelect al hacer click en un jugador", () => {
    const onPlayerSelect = vi.fn();
    render(
      <SelectPlayerModal
        {...baseProps}
        currentEventType="another_victim"
        onPlayerSelect={onPlayerSelect}
      />
    );

    const mariaCard = screen.getByText("María");
    fireEvent.click(mariaCard);
    expect(onPlayerSelect).toHaveBeenCalledWith(jugadoresMock[1]);
  });

  it("deshabilita el botón Confirmar si no hay selección", () => {
    render(<SelectPlayerModal {...baseProps} currentEventType="another_victim" />);
    const confirmButton = screen.getByRole("button", { name: /Confirmar/i });
    expect(confirmButton).toBeDisabled();
  });

  it("habilita el botón Confirmar si hay selección en another_victim", () => {
    const props = {
      ...baseProps,
      currentEventType: "another_victim",
      anotherVictim: { selectedPlayer: jugadoresMock[2] },
    };
    render(<SelectPlayerModal {...props} />);
    const confirmButton = screen.getByRole("button", { name: /Confirmar/i });
    expect(confirmButton).not.toBeDisabled();
  });

  it("llama a onConfirm cuando se hace click en Confirmar", () => {
    const onConfirm = vi.fn();
    const props = {
      ...baseProps,
      currentEventType: "another_victim",
      anotherVictim: { selectedPlayer: jugadoresMock[2] },
      onConfirm,
    };
    render(<SelectPlayerModal {...props} />);
    const confirmButton = screen.getByRole("button", { name: /Confirmar/i });
    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("llama a onCancel cuando se hace click en Cancelar", () => {
    const onCancel = vi.fn();
    render(<SelectPlayerModal {...baseProps} onCancel={onCancel} currentEventType="another_victim" />);
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  it("muestra mensaje correcto para detectives tipo A", () => {
    const props = {
      ...baseProps,
      detectiveType: "marple",
      detectiveAction: {},
    };
    render(<SelectPlayerModal {...props} />);
    expect(screen.getByText(/Selecciona un jugador para robar su secreto/i)).toBeInTheDocument();
  });

  it("muestra mensaje correcto cuando el jugador es el objetivo en detectives tipo B", () => {
    const props = {
      ...baseProps,
      detectiveType: "beresford",
      detectiveAction: { actionInProgress: { initiatorPlayerId: 2, targetPlayerId: 1 } },
    };
    render(<SelectPlayerModal {...props} />);
    expect(screen.getByText(/Has sido seleccionado por María/i)).toBeInTheDocument();
  });
});
