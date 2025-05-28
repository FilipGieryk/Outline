import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { extend, Application, useApplication } from "@pixi/react";
import {
  Container,
  Sprite,
  Graphics,
  RenderTexture,
  Assets,
  Rectangle,
  Texture,
  TilingSprite,
} from "pixi.js";

import { useImageContext } from "../context/ImageContext";
import useIndexedDB from "../hooks/useIndexedDB";
import { SCALE_MODES } from "@pixi/constants";
import useFloodFill from "../hooks/useFloodFill";

extend({ Container, Sprite, Graphics, TilingSprite });

const Canvas = () => {
  const {
    processedImages,
    selectedImageKey,
    selectedLayer,
    loadedTextures,
    setLoadedTextures,
    selectedColor,
    tool,
    sizeRef,
    appRef,
  } = useImageContext();

  // background gray squares
  // x on images deletes them
  // eraser shows what its gonna look like from erasing not at the end
  // const app = useApplication();
  const parentRef = useRef(null);
  const { floodFill } = useFloodFill();

  const [checkeredTexture, setCheckeredTexture] = useState(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const canvasRef = useRef(null);
  const { dbReady, putRecord, getAllRecords } = useIndexedDB();
  const [scaleFactor, setScaleFactor] = useState(1);
  const originalTextureObj = loadedTextures[selectedImageKey]?.[selectedLayer];
  const textureWidth = originalTextureObj?.texture?.width || 2000;
  const textureHeight = originalTextureObj?.texture?.height || 1000;

  // to hook like file upload or handle filse

  const loadTexture = (url, index = null, name = null) => {
    console.log("loadTexture");
    return Assets.load(url).then((texture) => ({
      url,
      texture,
      visible: true,
      name: name || `layer${index}`,
    }));
  };

  const loadAllTextures = async () => {
    console.log("loadAllTextures");
    try {
      console.log(processedImages);
      const textures2D = await Promise.all(
        processedImages.map(async (imageLayers) => {
          const textures = await Promise.all(
            imageLayers.map((url, index) => loadTexture(url, index))
          );
          return textures;
        })
      );
      console.log(textures2D);
      setLoadedTextures(textures2D);
      setTexturesLoaded(true);
    } catch (error) {
      console.error("Failed to load textures:", error);
    }
  };

  // // stays here
  useEffect(() => {
    console.log("useeffect on processedImages");
    // if (processedImages[0].length === 0) return; // Avoid unnecessary calls
    console.log(processedImages);
    loadAllTextures();
  }, [processedImages]);

  // // put texture urls to database
  // useEffect(() => {
  //   console.log("useeffect to put to db");
  //   if (!dbReady || !texturesLoaded || loadedTextures.length === 1) return;
  //   console.log("usedPutting to database ");

  //   loadedTextures.forEach((imageLayers, imgIndex) => {
  //     console.log("to db");
  //     const record = {
  //       id: imgIndex, // keyPath value
  //       name: `container-${imgIndex}`,
  //       images: imageLayers.map(({ url, name }) => ({ url, name })),
  //       timestamp: Date.now(),
  //     };
  //     putRecord(record)
  //       .then((id) => console.log(`Record updated with id ${id}`))
  //       .catch((err) => console.error(`Error updating record:`, err));
  //   });
  // }, [texturesLoaded, dbReady, loadedTextures]);

  // // make textures from database urls
  useEffect(() => {
    console.log("useeeffect to get from database");
    if (!dbReady || processedImages[0].length != 0) return;
    console.log("getting from database");
    getAllRecords()
      .then(async (items) => {
        const textures = await Promise.all(
          items.map(async (item) => {
            const imageLayers = await Promise.all(
              item.images.map(async ({ url, name }) => {
                try {
                  const texture = await loadTexture(url, undefined, name);
                  return texture;
                } catch (error) {
                  console.error("Error loading texture from URL:", url, error);
                  return { url, texture: null };
                }
              })
            );
            console.log(imageLayers);
            return imageLayers;
          })
        );
        console.log(textures);
        setLoadedTextures(textures);
      })
      .catch((error) =>
        console.error("Failed to fetch textures from IndexedDB:", error)
      );
  }, [dbReady]);

  const [drawingPath, setDrawingPath] = useState<number[][]>([]);
  const drawingRef = useRef(false);
  const handlePointerDown = (event, app) => {
    const pos = event.data.getLocalPosition(event.currentTarget);
    if (tool === "fill") {
      console.log(selectedColor);
      floodFill(pos.x, pos.y, selectedColor, app, scaleFactor);
      console.log("after");
    }
    drawingRef.current = true;
    setDrawingPath([[pos.x, pos.y]]);
  };
  const handlePointerMove = (event) => {
    console.log("handlepoitnermove");
    if (!drawingRef.current) return;
    const pos = event.data.getLocalPosition(event.currentTarget);
    setDrawingPath((prev) => [...prev, [pos.x, pos.y]]);
  };

  const handlePointerUp = (app) => {
    console.log("handlepoitnerup");
    drawingRef.current = false;
    if (drawingPath.length > 0) {
      applyDrawingToLayer(app);
    }
  };

  const draw = useCallback(
    (g: Graphics) => {
      console.log("draw");
      g.clear();

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

  const createCheckeredTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillRect(1, 1, 1, 1);

    ctx.fillStyle = "lightgray";
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillRect(0, 1, 1, 1);

    return Texture.from(canvas);
  };
  useEffect(() => {
    const texture = createCheckeredTexture();
    setCheckeredTexture(texture);
  }, []);

  const applyDrawingToLayer = async (app) => {
    console.log("appplydrawingtolayer");
    if (!app || drawingPath.length === 0) return;
    console.log("Applying drawing to layer...");

    const maskGraphics = new Graphics();
    const ctx = maskGraphics.context;

    // Set fill style and stroke color
    ctx.beginPath();
    ctx.strokeStyle = selectedColor;
    ctx.strokeStyle.width = sizeRef.current / scaleFactor;

    drawingPath.forEach(([x, y], i) => {
      const adjustedX = x / scaleFactor;
      const adjustedY = y / scaleFactor;
      if (i === 0) ctx.moveTo(adjustedX, adjustedY);
      else ctx.lineTo(adjustedX, adjustedY);
    });

    ctx.stroke(); // Apply stroke
    const originalTextureObj = loadedTextures[selectedImageKey][selectedLayer];
    if (!originalTextureObj) return;
    const { texture: originalTexture } = originalTextureObj;
    originalTexture.scaleMode = SCALE_MODES.NEAREST;

    // Create a sprite for the original texture
    const originalSprite = new Sprite(originalTexture);
    const container = new Container();

    // Use the mask on the original sprite
    if (tool === "erase") {
      originalSprite.setMask({
        mask: maskGraphics,
        inverse: true,
      });
    }

    // Add the original sprite to the container
    container.addChild(originalSprite);
    if (tool === "draw") {
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
            ? {
                ...layer,
                texture: renderTexture,
                url: newUrl,
              }
            : layer
      );
      console.log(newTextures);
      return newTextures;
    });

    // Clear drawing path for next time
    setDrawingPath([]);
  };

  useEffect(() => {
    if (!parentRef.current || !texturesLoaded) return;
    if (
      textureWidth &&
      textureHeight &&
      textureWidth !== 2000 &&
      textureHeight !== 1000
    ) {
      const { width, height } = parentRef.current.getBoundingClientRect();
      setScaleFactor(Math.min(width / textureWidth, height / textureHeight));
    }
  }, [parentRef, textureWidth, textureHeight, texturesLoaded]);

  useLayoutEffect(() => {
    const handleWheel = (event) => {
      const delta = Math.sign(event.deltaY);
      const zoomFactor = 1.1;
      if (delta < 0) {
        // Zoom in
        setScaleFactor((prev) => Math.min(prev * zoomFactor, 5)); // Limit maximum zoom level
      } else {
        // Zoom out
        setScaleFactor((prev) => Math.max(prev / zoomFactor, 0.2)); // Limit minimum zoom level
      }
    };

    const parentElement = parentRef.current;
    parentElement?.addEventListener("wheel", handleWheel);

    return () => {
      parentElement?.removeEventListener("wheel", handleWheel);
    };
  }, [parentRef.current]);

  const computedWidth = textureWidth * scaleFactor;
  const computedHeight = textureHeight * scaleFactor;
  useEffect(() => {
    console.log("change canvas size");
    if (!canvasRef.current || !appRef.current?.getApplication()) return;
    const app = appRef.current.getApplication();
    app.renderer.resize(computedWidth, computedHeight);
  }, [computedWidth, computedHeight]);

  const ImageComponent = ({ layerIndex, imgIndex }) => {
    const { width, height } = parentRef?.current.getBoundingClientRect();
    const { app } = useApplication();
    const scale =
      scaleFactor == 1
        ? Math.min(width / textureWidth, height / textureHeight)
        : scaleFactor;
    return (
      <pixiContainer key={layerIndex} visible={true}>
        <pixiSprite
          visible={loadedTextures[imgIndex]?.[layerIndex]?.visible === true}
          texture={loadedTextures[imgIndex]?.[layerIndex]?.texture}
          scale={{
            x: scale,
            y: scale,
          }}
        />
        {(() => {
          // if (!app) return null;
          // console.log("app screen width:", app.screen.width);
          if (imgIndex === selectedImageKey && layerIndex === selectedLayer) {
            console.log("sss");
            return (
              <pixiGraphics
                x={0}
                y={0}
                draw={draw}
                interactive={true}
                onPointerDown={(event) => handlePointerDown(event, app)}
                onPointerMove={handlePointerMove}
                onPointerUp={() => handlePointerUp(app)}
                hitArea={
                  new Rectangle(
                    0,
                    0,
                    textureWidth * scale,
                    textureHeight * scale
                  )
                }
              />
            );
          }
          return null;
        })()}
      </pixiContainer>
    );
  };

  if (!texturesLoaded) return <div>Loading...</div>;

  return (
    <div
      ref={parentRef}
      className="col-start-2 col-end-3 row-start-3 row-end-4 overflow-auto flex justify-center items-center"
    >
      {/* <div
        style={{ width: computedWidth, height: computedHeight }}
        ref={canvasRef}
        className="relative"
      > */}
      <Application resizeTo={parentRef} backgroundColor={0xffffff}>
        {/* <pixiSprite
            texture={checkeredTexture}
            // x={
            //   appRef.current?.getApplication().screen.width / 2 -
            //   textureWidth / 2
            // } // Align with texture
            // y={
            //   appRef.current?.getApplication().screen.height / 2 -
            //   textureHeight / 2
            // }
            width={textureWidth}
            height={textureHeight}
            interactive={false}
          /> */}
        {checkeredTexture && (
          <pixiTilingSprite
            texture={checkeredTexture}
            width={computedWidth}
            height={computedHeight}
            tileScale={{ x: scaleFactor, y: scaleFactor }}
          />
        )}

        {loadedTextures?.map((imageLayers, imgIndex) => (
          <pixiContainer key={imgIndex} visible={imgIndex === selectedImageKey}>
            {imageLayers.map((layer, layerIndex) => (
              <ImageComponent layerIndex={layerIndex} imgIndex={imgIndex} />
              // {/* <pixiGraphics
              //     x={
              //       (appRef.current?.getApplication()?.screen.width -
              //         textureWidth * scaleFactor) /
              //       2
              //     }
              //     y={
              //       (appRef.current?.getApplication()?.screen.height -
              //         textureHeight * scaleFactor) /
              //       2
              //     }
              //     draw={draw}
              //     interactive={true}
              //     onPointerDown={handlePointerDown}
              //     onPointerMove={handlePointerMove}
              //     onPointerUp={handlePointerUp}
              //     hitArea={
              //       new Rectangle(
              //         0,
              //         0,
              //         textureWidth * scaleFactor,
              //         textureHeight * scaleFactor
              //       )
              //     }
              //   /> */}

              // {(() => {
              //     if (!app) return null;
              //     console.log("app screen width:", app.screen.width);
              //     if (
              //       imgIndex === selectedImageKey &&
              //       layerIndex === selectedLayer
              //     ) {
              //       return (
              //         <pixiGraphics
              //           x={
              //             (appRef.current?.getApplication()?.screen.width -
              //               textureWidth * scaleFactor) /
              //             2
              //           }
              //           y={
              //             (appRef.current?.getApplication()?.screen.height -
              //               textureHeight * scaleFactor) /
              //             2
              //           }
              //           draw={draw}
              //           interactive={true}
              //           onPointerDown={handlePointerDown}
              //           onPointerMove={handlePointerMove}
              //           onPointerUp={handlePointerUp}
              //            hitArea={
              //              new Rectangle(
              //                0,
              //                0,
              //                textureWidth * scaleFactor,
              //                textureHeight * scaleFactor
              //          )
              //        }
              //       />
              //      );
              //    }
              //    return null;
              // })()}
            ))}
          </pixiContainer>
        ))}
      </Application>
      {/* </div> */}
    </div>
  );
};

export default Canvas;
