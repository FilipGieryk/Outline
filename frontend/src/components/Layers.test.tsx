import { render, screen } from "@testing-library/react";
import { Layers } from "./Layers";

test("Layers Compoent is rendering", () => {
  render(<Layers />);

  expect(screen.getByText(/layers/i)).toBeInTheDocument();
});
