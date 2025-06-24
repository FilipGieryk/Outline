import { render, screen } from "@testing-library/react";
import { UploadFiles } from "./UploadFiles";

test("UploadFiles copmnent to render", () => {
  render(<UploadFiles />);

  expect(screen.getByText(/uploadFiles/i)).toBeInTheDocument();
});
