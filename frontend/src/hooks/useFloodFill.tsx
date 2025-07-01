import { useImageContext } from "../context/ImageContext";
import { floodFillCanvas } from "../core/canvas/floodFill";
import { createTextureFromPixels } from "../utils/canvas";
import { Texture } from "pixi.js";

const useFloodFill = () => {
  const {
    loadedTextures,
    setLoadedTextures,
    selectedImageKey,
    selectedLayer,
    undoStacks,
  } = useImageContext();

  const floodFill = async (
    x: number,
    y: number,
    newColor: string,
    app: any
  ) => {
    const texture = loadedTextures[selectedImageKey][selectedLayer]?.texture;
    if (!texture || !app?.renderer) return;
    console.log(texture);

    const width = texture.width;
    const height = texture.height;

    const { pixels } = app.renderer.extract.pixels(texture);
    console.log(pixels);
    const filledPixels = floodFillCanvas(pixels, width, height, x, y, newColor);
    console.log(filledPixels);
    const newTexture = await createTextureFromPixels(
      filledPixels,
      width,
      height,
      app
    );
    if (!newTexture) return;
    const newUrl = await app.renderer.extract.base64(newTexture);

    const imageKeyStr = selectedImageKey.toString();

    undoStacks[imageKeyStr]?.add({
      layerIndex: selectedLayer,
      url: newUrl,
    });

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
