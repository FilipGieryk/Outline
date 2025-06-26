import { Assets } from "pixi.js";

export const loadTexture = (url: string, index?: number, name?: string) => {
  return Assets.load(url).then((texture) => ({
    url,
    texture,
    visible: true,
    name: name || `layer${index}`,
  }));
};

export const loadAllTextures = async (processedImages: string[][]) => {
  return Promise.all(
    processedImages.map(async (imageLayers) => {
      const textures = await Promise.all(
        imageLayers.map((url, index) => loadTexture(url, index))
      );
      return textures;
    })
  );
};
