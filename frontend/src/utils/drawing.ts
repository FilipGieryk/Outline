import {
  Graphics,
  Container,
  RenderTexture,
  Sprite,
  SCALE_MODES,
  Application,
} from "pixi.js";

export const renderDrawingToTexture = (
  app: Application,
  drawingPath: number[][],
  color: string,
  size: number,
  originalTexture: any,
  tool: string
) => {
  if (drawingPath.length === 0) return null;

  const maskGraphics = new Graphics();
  const ctx = maskGraphics.context;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.strokeStyle.width = size;

  drawingPath.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // add scale to resolution
  originalTexture.scaleMode = "nearest";

  const originalSprite = new Sprite(originalTexture);
  const container = new Container();

  if (tool === "erase") {
    originalSprite.setMask({ mask: maskGraphics, inverse: true });
  }
  container.addChild(originalSprite);

  if (tool === "draw") {
    container.addChild(maskGraphics);
  }

  const renderTexture = RenderTexture.create({
    width: originalTexture.width,
    height: originalTexture.height,
  });

  app.renderer.render(container, { renderTexture, clear: true });

  return renderTexture;
};
