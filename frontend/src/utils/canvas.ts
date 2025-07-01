import { Application, RenderTexture, Texture } from "pixi.js";

export const createBlankTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1000;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const baseTexture = Texture.from(canvas);

  return {
    url: canvas.toDataURL(),
    texture: baseTexture,
    name: "layer0",
    visible: true,
  };
};

export function hexToRgba(hex: string) {
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

export function colorMatch(
  color1: { r: number; g: number; b: number; a: number },
  color2: { r: number; g: number; b: number; a: number },
  tolerance: number = 30
) {
  return (
    Math.abs(color1.r - color2.r) <= tolerance &&
    Math.abs(color1.g - color2.g) <= tolerance &&
    Math.abs(color1.b - color2.b) <= tolerance &&
    Math.abs(color1.a - color2.a) <= tolerance
  );
}

export async function createTextureFromPixels(
  pixels: Uint8Array,
  width: number,
  height: number,
  app: Application
) {
  const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
  const bitmap = await createImageBitmap(imageData);

  const texture = RenderTexture.from(bitmap);
  return texture;
}
