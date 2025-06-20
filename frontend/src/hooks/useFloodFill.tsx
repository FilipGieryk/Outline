// import { useCallback, useEffect } from "react";
// import { useImageContext } from "../context/ImageContext";

import { useImageContext } from "../context/ImageContext";
import { Texture, BaseTexture } from "pixi.js";

// const useFloodFill = (canvasRef, ctxRef, updateProcessedImage) => {
//   const { toolRef } = useImageContext();
//   const floodFill = useCallback(
//     (x, y, fillColor) => {
//       const app = appRef.current?.getApplication();
//       const sprite = spriteRef.current;
//       if (!app || !sprite) return;

//       // Extract pixel data from the sprite's texture
//       const renderTexture = PIXI.RenderTexture.create({
//         width: sprite.width,
//         height: sprite.height,
//       });

//       app.renderer.render(sprite, { renderTexture });
//       const canvas = app.renderer.plugins.extract.canvas(renderTexture);
//       const ctx = canvas.getContext("2d");
//       const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//       const pixels = imageData.data;

//       const getPixelColor = (x, y) => {
//         const index = (y * canvas.width + x) * 4;
//         return {
//           r: pixels[index],
//           g: pixels[index + 1],
//           b: pixels[index + 2],
//           a: pixels[index + 3],
//         };
//       };

//       const setPixelColor = (x, y, color) => {
//         const index = (y * canvas.width + x) * 4;
//         pixels[index] = color.r;
//         pixels[index + 1] = color.g;
//         pixels[index + 2] = color.b;
//         pixels[index + 3] = 255; // Full opacity
//       };

//       const colorMatch = (c1, c2, tolerance = 10) => {
//         return (
//           Math.abs(c1.r - c2.r) <= tolerance &&
//           Math.abs(c1.g - c2.g) <= tolerance &&
//           Math.abs(c1.b - c2.b) <= tolerance &&
//           Math.abs(c1.a - c2.a) <= tolerance
//         );
//       };

//       const targetColor = getPixelColor(x, y);
//       if (colorMatch(targetColor, fillColor)) return;

//       // Flood fill using a queue
//       const queue = [{ x, y }];
//       const visited = new Set();
//       visited.add(`${x},${y}`);

//       while (queue.length > 0) {
//         const { x, y } = queue.shift();
//         if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;

//         const currentColor = getPixelColor(x, y);
//         if (colorMatch(currentColor, targetColor)) {
//           setPixelColor(x, y, fillColor);

//           const neighbors = [
//             { x: x + 1, y },
//             { x: x - 1, y },
//             { x, y + 1 },
//             { x, y - 1 },
//           ];

//           for (const neighbor of neighbors) {
//             const key = `${neighbor.x},${neighbor.y}`;
//             if (!visited.has(key)) {
//               queue.push(neighbor);
//               visited.add(key);
//             }
//           }
//         }
//       }

//       // Apply modified image data back to the texture
//       ctx.putImageData(imageData, 0, 0);
//       const newTexture = PIXI.Texture.from(canvas);
//       updateProcessedTexture(newTexture);
//     },
//     [appRef, spriteRef, updateProcessedTexture]
//   );

//   useEffect(() => {
//     const app = appRef.current?.getApplication();
//     if (!app) return;

//     const handleClick = (event) => {
//       if (toolRef.current !== "fill") return;
//       const sprite = spriteRef.current;
//       if (!sprite) return;

//       const pos = event.data.getLocalPosition(sprite);
//       const x = Math.floor(pos.x);
//       const y = Math.floor(pos.y);

//       floodFill(x, y, { r: 255, g: 0, b: 0 });
//     };

//     app.stage.interactive = true;
//     app.stage.on("pointerdown", handleClick);

//     return () => {
//       app.stage.off("pointerdown", handleClick);
//     };
//   }, [appRef, floodFill, toolRef]);

//   return { floodFill };
// };

// export default useFloodFill;

function hexToRgba(hex) {
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

  const colorMatch = (color1, color2, tolerance = 30) => {
    return (
      Math.abs(color1.r - color2.r) <= tolerance &&
      Math.abs(color1.g - color2.g) <= tolerance &&
      Math.abs(color1.b - color2.b) <= tolerance &&
      Math.abs(color1.a - color2.a) <= tolerance
    );
  };

  const floodFill = (x, y, newColor, app) => {
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

    if (colorMatch(targetColor, newColor)) {
      return; // No need to fill
    }

    const queue = [{ x, y }];
    const visited = new Set();
    visited.add(`${x},${y}`);
    const newColorRgb = hexToRgba(newColor);
    while (queue.length > 0) {
      const { x, y } = queue.shift();
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

    const createTextureFromPixels = (pixels, width, height) => {
      // 1. Create offscreen canvas at original size
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

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
