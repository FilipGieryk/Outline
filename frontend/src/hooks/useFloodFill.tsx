import { useImageContext } from "../context/ImageContext";
import { Texture } from "pixi.js";

function hexToRgba(hex: string) {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const num = parseInt(hex, 16);

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 255,
  };
}

const useFloodFill = () => {
  const { loadedTextures, setLoadedTextures, selectedImageKey, selectedLayer } =
    useImageContext();

  interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
  }

  const colorMatch = (color1: Color, color2: Color, tolerance: number = 30) => {
    return (
      Math.abs(color1.r - color2.r) <= tolerance &&
      Math.abs(color1.g - color2.g) <= tolerance &&
      Math.abs(color1.b - color2.b) <= tolerance &&
      Math.abs(color1.a - color2.a) <= tolerance
    );
  };

  const floodFill = (x: number, y: number, newColor: string, app: any) => {
    console.log(newColor);
    const texture = loadedTextures[selectedImageKey][selectedLayer]?.texture;
    if (!texture || !app?.renderer) return;

    const width = texture.width;
    const height = texture.height;

    const { pixels } = app.renderer.extract.pixels(texture);

    x = Math.floor(x);
    y = Math.floor(y);

    const index = (y * width + x) * 4;
    const targetColor = {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2],
      a: pixels[index + 3],
    };

    const newColorRgb = hexToRgba(newColor);
    if (colorMatch(targetColor, newColorRgb)) {
      return; // No need to fill
    }

    const queue = [{ x, y }];
    const visited = new Set();
    visited.add(`${x},${y}`);
    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const i = (y * width + x) * 4;

      pixels[i] = newColorRgb.r;
      pixels[i + 1] = newColorRgb.g;
      pixels[i + 2] = newColorRgb.b;
      pixels[i + 3] = 255;

      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (
          neighbor.x >= 0 &&
          neighbor.x < width &&
          neighbor.y >= 0 &&
          neighbor.y < height &&
          !visited.has(key)
        ) {
          const ni = (neighbor.y * width + neighbor.x) * 4;
          const nc = {
            r: pixels[ni],
            g: pixels[ni + 1],
            b: pixels[ni + 2],
            a: pixels[ni + 3],
          };

          if (colorMatch(nc, targetColor)) {
            queue.push(neighbor);
            visited.add(key);
          }
        }
      }
    }

    const createTextureFromPixels = (
      pixels: number[],
      width: number,
      height: number
    ) => {
      // 1. Create offscreen canvas at original size
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // 2. Create and put image data
      const imageData = new ImageData(
        new Uint8ClampedArray(pixels),
        width,
        height
      );
      ctx.putImageData(imageData, 0, 0);

      // 3. Create scaled canvas
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = width;
      scaledCanvas.height = height;
      const scaledCtx = scaledCanvas.getContext("2d");
      if (!scaledCtx) return;

      // 4. Draw the original canvas into scaled canvas

      scaledCtx.drawImage(
        canvas,
        0,
        0,
        scaledCanvas.width,
        scaledCanvas.height
      );

      // 5. Return PIXI texture
      return Texture.from(scaledCanvas);
    };

    const renderTexture = createTextureFromPixels(pixels, width, height);

    const newUrl = app.renderer.extract.base64(renderTexture);
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
  };

  return { floodFill };
};

export default useFloodFill;
