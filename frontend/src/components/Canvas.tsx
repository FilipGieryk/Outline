import React, { useCallback, useEffect, useRef, useState } from "react";
import { extend, Application, useApplication } from "@pixi/react";
import {
  Container,
  Sprite,
  Texture,
  Graphics,
  RenderTexture,
  Assets,
  Rectangle,
  Filter,
} from "pixi.js";

import { useImageContext } from "../context/ImageContext";
import useIndexedDB from "../hooks/useIndexedDB";
import { BLEND_MODES } from "@pixi/constants";
import useFloodFill from "../hooks/useFloodFill";

extend({ Container, Sprite, Graphics });

const Canvas = () => {
  const {
    processedImages,
    selectedImageKey,
    selectedLayer,
    loadedTextures,
    setLoadedTextures,
    selectedColor,
    toolRef,
    sizeRef,
  } = useImageContext();
  const parentRef = useRef(null);
  const appRef = useRef(null);
  const { floodFill } = useFloodFill();
  const [checkeredTexture, setCheckeredTexture] = useState(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const { dbReady, putRecord, getAllRecords, dbItems } = useIndexedDB();

  const originalTextureObj = loadedTextures[selectedImageKey]?.[selectedLayer];
  const textureWidth = originalTextureObj?.texture?.width || 2000;
  const textureHeight = originalTextureObj?.texture?.height || 1000;

  const loadTexture = (url) =>
    Assets.load(url).then((texture) => ({ url, texture }));

  const loadAllTextures = async () => {
    try {
      console.log(processedImages);
      const textures2D = await Promise.all(
        processedImages.map(async (imageLayers) => {
          // For each image's layers, load their textures in order
          const textures = await Promise.all(
            imageLayers.map((url) => loadTexture(url))
          );
          return textures;
        })
      );
      console.log("cehck dta");
      console.log(textures2D);
      setLoadedTextures(textures2D);
      setTexturesLoaded(true);
    } catch (error) {
      console.error("Failed to load textures:", error);
    }
  };

  useEffect(() => {
    if (!processedImages.length) return; // Avoid unnecessary calls
    loadAllTextures();
  }, [processedImages]);

  // put texture urls to database
  useEffect(() => {
    if (!dbReady || !texturesLoaded || loadedTextures.length === 1) return;
    console.log(loadedTextures);

    loadedTextures.forEach((imageLayers, imgIndex) => {
      const record = {
        id: imgIndex, // keyPath value
        name: `container-${imgIndex}`,
        images: imageLayers.map(({ url }) => ({ url })),
        timestamp: Date.now(),
      };
      putRecord(record)
        .then((id) => console.log(`Record updated with id ${id}`))
        .catch((err) => console.error(`Error updating record:`, err));
    });
  }, [texturesLoaded, dbReady, loadedTextures]);

  // make textures from database urls
  useEffect(() => {
    if (!dbReady) return;
    getAllRecords()
      .then(async (items) => {
        console.log("IndexedDB items:", items);

        const textures = await Promise.all(
          items.map(async (item) => {
            const imageLayers = await Promise.all(
              item.images.map(async ({ url }) => {
                try {
                  const texture = await loadTexture(url);
                  return texture;
                } catch (error) {
                  console.error("Error loading texture from URL:", url, error);
                  return { url, texture: null };
                }
              })
            );
            return imageLayers;
          })
        );

        console.log("Reconstructed textures:", textures);
        setLoadedTextures(textures);
      })
      .catch((error) =>
        console.error("Failed to fetch textures from IndexedDB:", error)
      );
  }, [dbReady]);

  const [drawingPath, setDrawingPath] = useState<number[][]>([]);
  const drawingRef = useRef(false);
  const handlePointerDown = (event) => {
    const pos = event.data.getLocalPosition(event.currentTarget);
    if (toolRef.current === "fill") {
      floodFill(pos.x, pos.y, selectedColor, appRef.current.getApplication());
    }
    drawingRef.current = true;
    setDrawingPath([[pos.x, pos.y]]);
  };
  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    const pos = event.data.getLocalPosition(event.currentTarget);
    setDrawingPath((prev) => [...prev, [pos.x, pos.y]]);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
    if (drawingPath.length > 0) {
      applyDrawingToLayer();
    }
  };

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();

      const ctx = g.context;
      ctx.beginPath(); // Start a new path

      ctx.strokeStyle = selectedColor;
      ctx.strokeStyle.width = sizeRef.current;
      drawingPath.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      console.log(drawingPath);
      ctx.stroke(); // Apply stroke
    },
    [drawingPath, textureWidth, textureHeight]
  );

  const applyDrawingToLayer = async () => {
    const app = appRef.current?.getApplication();
    if (!app || drawingPath.length === 0) return;
    console.log("Applying drawing to layer...");

    const maskGraphics = new Graphics();
    const ctx = maskGraphics.context;

    // Set fill style and stroke color
    ctx.beginPath();
    ctx.strokeStyle = selectedColor;
    ctx.strokeStyle.width = sizeRef.current;
    drawingPath.forEach(([x, y], i) => {
      const shiftedX = x + textureWidth / 2;
      const shiftedY = y + textureHeight / 2;

      if (i === 0) ctx.moveTo(shiftedX, shiftedY);
      else ctx.lineTo(shiftedX, shiftedY);
    });

    ctx.lineWidth = 20; // Set line width for visibility
    ctx.stroke(); // Apply stroke

    const originalTextureObj = loadedTextures[selectedImageKey][selectedLayer];
    if (!originalTextureObj) return;
    const { texture: originalTexture } = originalTextureObj;

    // Create a sprite for the original texture
    const originalSprite = new Sprite(originalTexture);
    const container = new Container();

    // Use the mask on the original sprite
    if (toolRef.current === "erase") {
      originalSprite.setMask({
        mask: maskGraphics,
        inverse: true,
      });
    }

    // Add the original sprite to the container
    container.addChild(originalSprite);
    if (toolRef.current === "draw") {
      container.addChild(maskGraphics);
    }

    // Render the container to the main texture
    const renderTexture = RenderTexture.create({
      width: originalTexture.width,
      height: originalTexture.height,
    });

    app.renderer.render(container, { renderTexture, clear: true });

    // Extract the final image
    const newUrl = await app.renderer.extract.base64(renderTexture);
    // Now update the state with the new URL string.
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

    // Clear drawing path for next time
    setDrawingPath([]);
  };

  // useEffect(() => {
  //   const app = appRef.current?.getApplication();
  //   if (!app) return;
  //   console.log("sss");

  //   const graphics = new Graphics();
  //   const size = 1; // Size of each checkered square
  //   const rows = Math.ceil(textureHeight / size);
  //   const cols = Math.ceil(textureWidth / size);

  //   graphics.clear();
  //   for (let y = 0; y < rows; y++) {
  //     for (let x = 0; x < cols; x++) {
  //       // Only draw the gray rectangles
  //       if ((x + y) % 2 === 0) {
  //         graphics.rect(x * size, y * size, size, size).fill(0xcccccc);
  //       }
  //     }
  //   }

  //   // Convert to a texture
  //   const texture = app.renderer.generateTexture(graphics);
  //   setCheckeredTexture(texture);
  //   graphics.destroy();
  // }, [selectedImageKey]);

  if (!texturesLoaded) return <div>Loading...</div>;
  console.log(loadedTextures);
  console.log(processedImages);
  return (
    <div
      ref={parentRef}
      className="col-start-2 col-end-3 row-start-3 row-end-4"
    >
      <Application resizeTo={parentRef} ref={appRef} backgroundColor={0xffffff}>
        {/* <pixiSprite
          texture={checkeredTexture}
          x={
            appRef.current?.getApplication().screen.width / 2 - textureWidth / 2
          } // Align with texture
          y={
            appRef.current?.getApplication().screen.height / 2 -
            textureHeight / 2
          }
          width={textureWidth}
          height={textureHeight}
          interactive={false}
        /> */}
        {loadedTextures.map((imageLayers, imgIndex) => (
          <pixiContainer key={imgIndex} visible={imgIndex === selectedImageKey}>
            {imageLayers.map((layer, layerIndex) => (
              <pixiContainer key={layerIndex} visible={true}>
                <pixiSprite
                  texture={loadedTextures[imgIndex]?.[layerIndex]?.texture}
                  anchor={0.5} // Center the sprite relative to its own dimensions
                  x={appRef.current?.getApplication().screen.width / 2} // Center on screen
                  y={appRef.current?.getApplication().screen.height / 2}
                />

                {(() => {
                  if (
                    imgIndex === selectedImageKey &&
                    layerIndex === selectedLayer
                  ) {
                    return (
                      <pixiGraphics
                        x={appRef.current?.getApplication().screen.width / 2}
                        y={appRef.current?.getApplication().screen.height / 2}
                        draw={draw}
                        interactive={true}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        hitArea={
                          new Rectangle(
                            -textureWidth / 2,
                            -textureHeight / 2,
                            textureWidth,
                            textureHeight
                          )
                        }
                      />
                    );
                  }
                  return null;
                })()}
              </pixiContainer>
            ))}
          </pixiContainer>
        ))}
      </Application>
    </div>
  );
};

export default Canvas;
