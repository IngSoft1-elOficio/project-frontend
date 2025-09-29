import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import HandCards from "../components/HandCards";
import * as GameContext from "../context/GameContext";

vi.mock("../context/GameContext", () => ({
  useGame: vi.fn(),
}));

const mockMano = [
  { id: 1, name: "Lady Eileen Bundle Brent" },
  { id: 2, name: "Miss Marple" },
  { id: 3, name: "Another Victim" },
];

beforeEach(() => {
  vi.clearAllMocks();
  GameContext.useGame.mockReturnValue({ gameState: { mano: mockMano } });
});

afterEach(() => {
  cleanup();
});

describe("HandCards", () => {
  it("renderiza una carta por cada entrada en gameState.mano", () => {
    const onSelect = vi.fn();
    render(<HandCards selectedCards={[]} onSelect={onSelect} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(mockMano.length);

    // comprueba que las imágenes/alt se renderizan con los nombres
    expect(screen.getByAltText("Lady Eileen Bundle Brent")).toBeInTheDocument();
    expect(screen.getByAltText("Miss Marple")).toBeInTheDocument();
    expect(screen.getByAltText("Another Victim")).toBeInTheDocument();
  });

  it("invoca onSelect con el id correcto al hacer click en una carta", () => {
    const onSelect = vi.fn();
    render(<HandCards selectedCards={[]} onSelect={onSelect} />);

    const btns = screen.getAllByRole("button");
    fireEvent.click(btns[1]); // segundo elemento -> id 2

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("muestra el estilo de selección cuando selectedCards contiene el id", () => {
    const onSelect = vi.fn();
    render(<HandCards selectedCards={[2]} onSelect={onSelect} />);

    // obtener el botón por índice (o por el alt del img)
    const selectedButton = screen.getAllByRole('button')[1];
    expect(selectedButton).toHaveStyle("box-shadow: 0 0 0 3px gold");

    // obtener el primer botón por índice en vez de getByTitle
    const notSelected = screen.getAllByRole('button')[0];
    expect(notSelected).not.toHaveStyle("box-shadow: 0 0 0 3px gold");
  });
});
