import { render, screen } from "@testing-library/react";
import { Tools } from "./Tools";

test("Tools compnent to be rendered", () => {
  render(<Tools />);

  expect(screen.getByText(/options/i)).toBeInTheDocument();
});
