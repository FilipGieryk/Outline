import { render, screen } from "@testing-library/react";
import { Options } from "./Options";

test("Options component to render", () => {
  render(<Options />);

  expect(screen.getByText(/options/i)).toBeInTheDocument();
});
