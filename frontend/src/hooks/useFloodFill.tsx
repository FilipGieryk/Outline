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

    // Extract pixel data
    const pixels = app.renderer.extract.pixels(texture).pixels;
    const width = texture.width;
    const height = texture.height;
    x = Math.floor(x + width / 2);
    y = Math.floor(y + height / 2);

    const index = (y * width + x) * 4;
    const targetColor = {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2],
      a: pixels[index + 3],
    };

    if (colorMatch(targetColor, newColor)) {
      return; // Same color, no need to fill
    }

    // BFS queue for flood fill
    const queue = [{ x, y }];
    const visited = new Set();
    visited.add(`${x},${y}`);

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const i = (y * width + x) * 4;

      // Change pixel color
      pixels[i] = newColor.r;
      pixels[i + 1] = newColor.g;
      pixels[i + 2] = newColor.b;
      pixels[i + 3] = 255; // Full opacity

      // Check neighbors
      const neighbors = [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 },
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
      // Create a new Canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Create ImageData from the pixels
      const imageData = new ImageData(
        new Uint8ClampedArray(pixels),
        width,
        height
      );

      // Put ImageData onto the canvas
      ctx.putImageData(imageData, 0, 0);

      // Create a texture from the canvas
      return Texture.from(canvas);
    };
    console.log(pixels);

    // Create new texture and apply it
    const renderTexture = createTextureFromPixels(pixels, width, height);
    console.log("yesss");
    console.log(renderTexture);
    const newUrl = app.renderer.extract.base64(renderTexture);
    setLoadedTextures((prev) => {
      const newTextures = [...prev];
      newTextures[selectedImageKey] = newTextures[selectedImageKey].map(
        (layer, index) =>
          index === selectedLayer
            ? { texture: renderTexture, url: newUrl }
            : layer
      );
      return newTextures;
    });
  };
  return { floodFill };
};

export default useFloodFill;
