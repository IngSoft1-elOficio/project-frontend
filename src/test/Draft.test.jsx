import { render, screen, fireEvent } from "@testing-library/react"; 
import { vi } from "vitest";
import Draft from "../components/game/Draft";

// Mock principal del contexto
vi.mock("../context/GameContext", () => ({
  useGame: vi.fn(() => ({
    gameState: {
      mazos: {
        deck: {
          draft: [
            { id: 1, name: "Hercule Poirot" },
            { id: 2, name: "Carta desconocida" },
            { id: 3, name: "" }
          ]
        }
      }
    }
  }))
}));

// Mock del helper de imágenes
vi.mock("../components/HelperImageCards", () => ({
  __esModule: true,
  default: (card) => {
    if (card.name === "Hercule Poirot") return "/cards/detective_poirot.png";
    return null;
  }
}));

describe("Draft component", () => {
  it("renderiza las cartas con o sin imagen", () => {
    const handleDraft = vi.fn();
    render(<Draft handleDraft={handleDraft} />);

    // Carta con imagen
    const image = screen.getByAltText("Hercule Poirot");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/cards/detective_poirot.png");

    // Carta sin imagen
    const fallbackCard = screen.getByText("Carta desconocida");
    expect(fallbackCard).toBeInTheDocument();
  });

  it("llama a handleDraft con el id correcto al hacer clic", () => {
    const handleDraft = vi.fn();
    render(<Draft handleDraft={handleDraft} />);

    const button = screen.getByAltText("Hercule Poirot").closest("button");
    fireEvent.click(button);

    expect(handleDraft).toHaveBeenCalledTimes(1);
    expect(handleDraft).toHaveBeenCalledWith(1);
  });

  it("para una carta sin nombre getCardsImage devuelve null y no renderiza <img>", () => {
    const handleDraft = vi.fn();
    render(<Draft handleDraft={handleDraft} />);

    const buttons = screen.getAllByRole("button");
    const thirdButton = buttons[2];

    const imgInside = thirdButton.querySelector("img");
    expect(imgInside).toBeNull();

    fireEvent.click(thirdButton);
    expect(handleDraft).toHaveBeenCalledWith(3);
  });

  it("maneja correctamente cuando el draft está vacío o indefinido", () => {
    const handleDraft = vi.fn();
    const { container } = render(<Draft handleDraft={handleDraft} />);
    expect(container).toBeInTheDocument();
    expect(container.querySelectorAll("button").length).toBe(3);
  });
});
