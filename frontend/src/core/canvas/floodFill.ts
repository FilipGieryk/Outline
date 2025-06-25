import { hexToRgba, colorMatch } from "../../utils/canvas";

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const floodFillCanvas = (
  pixels: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  newColor: string
): Uint8Array => {
  x = Math.floor(x);
  y = Math.floor(y);

  const index = (y * width + x) * 4;
  const targetColor: Color = {
    r: pixels[index],
    g: pixels[index + 1],
    b: pixels[index + 2],
    a: pixels[index + 3],
  };

  const newColorRgb = hexToRgba(newColor);
  if (colorMatch(targetColor, newColorRgb)) return pixels;

  const queue = [{ x, y }];
  const visited = new Set<string>([`${x},${y}`]);

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
        const nc: Color = {
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

  return pixels;
};
