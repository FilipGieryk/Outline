import { render, screen } from "@testing-library/react";
import { ImagesSelection } from "./ImagesSelection";

test("ImageSelection component to render", () => {
  render(<ImagesSelection />);

  expect(screen.getByText(/img/i)).toBeInTheDocument();
});
