import { useImageContext } from "../context/ImageContext";
import { floodFillCanvas } from "../core/canvas/floodFill";
import { createTextureFromPixels } from "../utils/canvas";
import { Texture } from "pixi.js";

const useFloodFill = () => {
  const { loadedTextures, setLoadedTextures, selectedImageKey, selectedLayer } =
    useImageContext();

  const floodFill = (x: number, y: number, newColor: string, app: any) => {
    const texture = loadedTextures[selectedImageKey][selectedLayer]?.texture;
    if (!texture || !app?.renderer) return;

    const width = texture.width;
    const height = texture.height;

    const { pixels } = app.renderer.extract.pixels(texture);
    const filledPixels = floodFillCanvas(pixels, width, height, x, y, newColor);

    const canvas = createTextureFromPixels(filledPixels, width, height);
    if (!canvas) return;

    const newTexture = Texture.from(canvas);
    const newUrl = canvas.toDataURL();

    setLoadedTextures((prev) => {
      const newTextures = [...prev];
      newTextures[selectedImageKey] = newTextures[selectedImageKey].map(
        (layer, index) =>
          index === selectedLayer
            ? { ...layer, texture: newTexture, url: newUrl }
            : layer
      );
      return newTextures;
    });
  };

  return { floodFill };
};

export default useFloodFill;
