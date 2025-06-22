import {
  Application,
  Container,
  Graphics,
  RenderTexture,
  SCALE_MODES,
  Sprite,
} from "pixi.js";
import { useImageContext } from "../context/ImageContext";
import { Dispatch, SetStateAction } from "react";

export const useApplyDrawingToLayer = () => {
  const {
    sizeRef,
    selectedColor,
    loadedTextures,
    setLoadedTextures,
    selectedImageKey,
    selectedLayer,
    tool,
  } = useImageContext();

  const applyDrawingToLayer = async (
    app: Application,
    drawingPath: number[][],
    setDrawingPath: Dispatch<SetStateAction<number[][]>>
  ) => {
    console.log("test");
    if (!app || drawingPath.length === 0) return;
    console.log("test");
    const maskGraphics = new Graphics();
    const ctx = maskGraphics.context;

    ctx.beginPath();
    ctx.strokeStyle = selectedColor;
    ctx.strokeStyle.width = sizeRef.current;

    drawingPath.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke(); // Apply stroke
    const originalTextureObj = loadedTextures[selectedImageKey][selectedLayer];
    if (!originalTextureObj) return;
    const { texture: originalTexture } = originalTextureObj;
    originalTexture.scaleMode = SCALE_MODES.NEAREST;

    // Create a sprite for the original texture
    const originalSprite = new Sprite(originalTexture);
    const container = new Container();

    // Use the mask on the original sprite
    if (tool === "erase") {
      originalSprite.setMask({
        mask: maskGraphics,
        inverse: true,
      });
    }

    // Add the original sprite to the container
    container.addChild(originalSprite);
    if (tool === "draw") {
      container.addChild(maskGraphics);
    }

    // Render the container to the main texture
    const renderTexture = RenderTexture.create({
      width: originalTexture.width,
      height: originalTexture.height,
    });
    app.renderer.render(container, { renderTexture, clear: true });

    // Extract the final image
    const newUrl = await app.renderer.extract.base64(renderTexture);
    // Now update the state with the new URL string.
    setLoadedTextures((prev) => {
      const newTextures = [...prev];
      newTextures[selectedImageKey] = newTextures[selectedImageKey].map(
        (layer, index) =>
          index === selectedLayer
            ? {
                ...layer,
                texture: renderTexture,
                url: newUrl,
              }
            : layer
      );
      return newTextures;
    });
    // Clear drawing path for next time
    setDrawingPath([]);
  };

  return applyDrawingToLayer;
};
