import { render, screen } from "@testing-library/react";
import Canvas from "./Canvas";

test("Canvas component is rendering", () => {
  render(<Canvas />);

  expect(screen.getByText(/sd/i)).toBeInTheDocument();
});
