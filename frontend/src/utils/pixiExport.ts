import { RenderTexture, type Container, type Renderer } from "pixi.js";

export const downloadPixiContainerImage = (
  renderer: Renderer,
  container: Container,
  filename: string = "merged.png"
) => {
  const bounds = container.getLocalBounds();
  const renderTexture = RenderTexture.create({
    width: bounds.width,
    height: bounds.height,
  });

  const originalScale = container.scale.x;
  const originalPosition = { x: container.x, y: container.y };
  container.position.set(-bounds.x, -bounds.y);
  container.scale.set(1);

  renderer.render(container, { renderTexture });

  container.position.set(originalPosition.x, originalPosition.y);
  container.scale.set(originalScale);
  const canvas = renderer.extract.canvas(renderTexture);
  const link = document.createElement("a");
  link.download = filename;
  if (canvas.toDataURL) link.href = canvas.toDataURL("image/png");
  link.click();
};
