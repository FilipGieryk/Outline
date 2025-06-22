// import { useEffect, useRef, useCallback } from "react";
// import { useImageContext } from "../context/ImageContext";
// import * as PIXI from "pixi.js";

// const useCanvas = () => {
//   const {
//     processedImages,
//     setProcessedImages,
//     selectedImageKey,
//     layerNum,
//     selectedColor,
//   } = useImageContext();

//   const appRef = useRef(null);
//   const graphicsRef = useRef(new PIXI.Graphics());
//   const lastPosition = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     // Initialize PixiJS Application
//     const app = new PIXI.Application({
//       width: window.innerWidth,
//       height: window.innerHeight,
//       backgroundColor: 0xffffff,
//     });
//     appRef.current = app;
//     document.body.appendChild(app.view); // Attach the canvas to the document
//     app.stage.addChild(graphicsRef.current);

//     return () => {
//       app.destroy(true);
//     };
//   }, []);

//   useEffect(() => {
//     const selectedImage = processedImages[selectedImageKey]?.[layerNum];
//     if (selectedImage) {
//       const img = PIXI.Texture.from(selectedImage);
//       const sprite = new PIXI.Sprite(img);
//       sprite.width = appRef.current.renderer.width;
//       sprite.height = appRef.current.renderer.height;
//       appRef.current.stage.addChild(sprite);
//     }
//   }, [selectedImageKey, layerNum, processedImages]);

//   const startDrawing = (e) => {
//     const { x, y } = e.data.global;
//     lastPosition.current = { x, y };
//     graphicsRef.current.lineStyle(2, selectedColor, 1);
//     graphicsRef.current.moveTo(x, y);
//   };

//   const stopDrawing = () => {
//     graphicsRef.current.endFill();
//   };

//   const draw = (e) => {
//     const { x, y } = e.data.global;
//     graphicsRef.current.lineTo(x, y);
//   };

//   useEffect(() => {
//     const canvas = appRef.current.view;
//     canvas.addEventListener("mousedown", startDrawing);
//     canvas.addEventListener("mousemove", draw);
//     canvas.addEventListener("mouseup", stopDrawing);
//     canvas.addEventListener("mouseleave", stopDrawing);

//     return () => {
//       canvas.removeEventListener("mousedown", startDrawing);
//       canvas.removeEventListener("mousemove", draw);
//       canvas.removeEventListener("mouseup", stopDrawing);
//       canvas.removeEventListener("mouseleave", stopDrawing);
//     };
//   }, []);

//   const mergeDrawing = () => {
//     // Handle the merging of drawings into processedImages state if needed
//   };

//   return {
//     updateProcessedImage: mergeDrawing,
//   };
// };

// export default useCanvas;
