import type { Application } from "pixi.js";
import { useImageContext } from "../context/ImageContext";
import { renderDrawingToTexture } from "../utils/drawing";

export const useApplyDrawingToLayer = () => {
  const {
    sizeRef,
    selectedColor,
    loadedTextures,
    setLoadedTextures,
    selectedImageKey,
    selectedLayer,
    tool,
    undoStacks,
    ensureUndoStack,
  } = useImageContext();

  const applyDrawingToLayer = async (
    app: Application,
    drawingPath: number[][],
    setDrawingPath: React.Dispatch<React.SetStateAction<number[][]>>
  ) => {
    const originalTextureObj =
      loadedTextures[selectedImageKey]?.[selectedLayer];
    if (!app || !originalTextureObj) return;
    const newTexture = renderDrawingToTexture(
      app,
      drawingPath,
      selectedColor,
      sizeRef.current,
      originalTextureObj.texture,
      tool
    );

    if (!newTexture) return;

    const newUrl = await app.renderer.extract.base64(newTexture);

    const imageKeyStr = selectedImageKey.toString();
    if (!undoStacks[imageKeyStr]) {
      ensureUndoStack(selectedImageKey, {
        layerIndex: selectedLayer,
        url: originalTextureObj.url, // use current layer's url as initial state
      });
    }

    undoStacks[imageKeyStr]?.add({
      layerIndex: selectedLayer,
      url: newUrl,
    });

    setLoadedTextures((prev) => {
      const newTextures = [...prev];
      newTextures[selectedImageKey] = newTextures[selectedImageKey].map(
        (layer, index) =>
          index === selectedLayer
            ? {
                ...layer,
                texture: newTexture,
                url: newUrl,
              }
            : layer
      );
      return newTextures;
    });

    setDrawingPath([]);
  };

  return applyDrawingToLayer;
};
