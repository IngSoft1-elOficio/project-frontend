import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HandCards from "../components/HandCards";
import * as GameContext from "../context/GameContext";

const mockGameState = {
  mano: [
    { id: 1, name: "Murderer Escapes" }, // tiene imagen
    { id: 2, name: "Unknown Card" },     // fallback
    { id: 3, name: "" },                  // fallback
    { id: 4, name: undefined },           // fallback
  ],
};

vi.spyOn(GameContext, "useGame").mockReturnValue({ gameState: mockGameState });

describe("HandCards component", () => {
  it("renderiza todas las cartas y fallback, y llama a onSelect", () => {
    const mockOnSelect = vi.fn();
    render(<HandCards selectedCards={[1]} onSelect={mockOnSelect} />);

    expect(screen.getByAltText("Murderer Escapes")).toBeInTheDocument();

    expect(screen.getByText("Unknown Card")).toBeInTheDocument();
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);

    fireEvent.click(buttons[0]);
    expect(mockOnSelect).toHaveBeenCalledWith(1);
    fireEvent.click(buttons[2]);
    expect(mockOnSelect).toHaveBeenCalledWith(3);
  });
});
