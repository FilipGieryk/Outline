import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const usePixiCanvas = () => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Initialize PixiJS application
    appRef.current = new PIXI.Application({
      view: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x1099bb,
    });

    // Cleanup on component unmount
    return () => {
      appRef.current.destroy(true, { children: true });
    };
  }, []);

  return { canvasRef, app: appRef.current };
};

export default usePixiCanvas;
