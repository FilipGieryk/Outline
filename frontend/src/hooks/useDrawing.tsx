import { useCallback, useRef, useState } from "react";
import { useImageContext } from "../context/ImageContext";
import { Graphics } from "pixi.js";
import { useApplyDrawingToLayer } from "./useApplyDrawingToLayer";
import useFloodFill from "./useFloodFill";

export const useDrawing = (textureWidth: any, textureHeight: any) => {
  const { selectedColor, tool, sizeRef } = useImageContext();
  const drawingRef = useRef(false);
  const applyDrawingToLayer = useApplyDrawingToLayer();
  const { floodFill } = useFloodFill();
  const [drawingPath, setDrawingPath] = useState<number[][]>([]);

  const handlePointerDown = (event, app, graphicsRef) => {
    const pos = graphicsRef.current.toLocal(event.data.global);

    if (tool === "fill") {
      floodFill(pos.x, pos.y, selectedColor, app);
    }

    drawingRef.current = true;
    setDrawingPath([[pos.x, pos.y]]);
  };

  const handlePointerMove = (event, graphicsRef) => {
    if (!drawingRef.current || !graphicsRef.current) return;
    const pos = graphicsRef.current.toLocal(event.data.global);
    setDrawingPath((prev) => [...prev, [pos.x, pos.y]]);
  };

  const handlePointerUp = (app) => {
    console.log("handlepoitnerup");

    drawingRef.current = false;
    if (drawingPath.length > 0) {
      applyDrawingToLayer(app, drawingPath, setDrawingPath);
    }
  };

  const draw = useCallback(
    (g: Graphics) => {
      const ctx = g.context;
      ctx.beginPath(); // Start a new path
      ctx.strokeStyle = selectedColor;
      ctx.strokeStyle.width = sizeRef.current;
      drawingPath.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke(); // Apply stroke
    },
    [drawingPath, textureWidth, textureHeight]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    draw,
  };
};
function useApplyDrawing() {
  throw new Error("Function not implemented.");
}
