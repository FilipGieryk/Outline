import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("Button component is rendering", () => {
  const mockContent = "button";

  render(<Button content={mockContent} />);

  expect(screen.getByText(/{mockContent}/i)).toBeInTheDocument();
});
