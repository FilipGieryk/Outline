import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
import CanvasLayout from "./CanvasLayout";
import ContainerComponent from "./ContainerComponent";
import ImageComponent from "./ImageComponent";
import { useDrawing } from "../hooks/useDrawing";

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
  const initialPositionsRef = useRef(new Map());
  const currentPositionsRef = useRef(new Map());
  const containerRefs = useRef(new Map());
  console.log("textures");
  console.log(loadedTextures);

  const scaleRef = useRef(1);

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

  // const [drawingPath, setDrawingPath] = useState<number[][]>([]);
  // const drawingRef = useRef(false);
  // const handlePointerDown = (event, app, graphicsRef) => {
  //   const pos = graphicsRef.current.toLocal(event.data.global);
  //   if (tool === "fill") {
  //     floodFill(pos.x, pos.y, selectedColor, app, scaleFactor);
  //   }
  //   drawingRef.current = true;
  //   setDrawingPath([[pos.x, pos.y]]);
  // };
  // const handlePointerMove = (event, graphicsRef) => {
  //   if (!drawingRef.current || !graphicsRef.current) return;
  //   const pos = graphicsRef.current.toLocal(event.data.global);
  //   setDrawingPath((prev) => [...prev, [pos.x, pos.y]]);
  // };

  // const handlePointerUp = (app) => {
  //   console.log("handlepoitnerup");
  //   drawingRef.current = false;
  //   if (drawingPath.length > 0) {
  //     applyDrawingToLayer(app);
  //   }
  // };

  // const draw = useCallback(
  //   (g: Graphics) => {
  //     g.clear();

  //     const ctx = g.context;
  //     ctx.beginPath(); // Start a new path
  //     ctx.strokeStyle = selectedColor;
  //     ctx.strokeStyle.width = sizeRef.current;
  //     drawingPath.forEach(([x, y], i) => {
  //       if (i === 0) ctx.moveTo(x, y);
  //       else ctx.lineTo(x, y);
  //     });
  //     ctx.stroke(); // Apply stroke
  //   },
  //   [drawingPath, textureWidth, textureHeight]
  // );

  // const createCheckeredTexture = () => {
  //   const canvas = document.createElement("canvas");
  //   canvas.width = 2;
  //   canvas.height = 2;
  //   const ctx = canvas.getContext("2d");

  //   ctx.fillStyle = "white";
  //   ctx.fillRect(0, 0, 1, 1);
  //   ctx.fillRect(1, 1, 1, 1);

  //   ctx.fillStyle = "lightgray";
  //   ctx.fillRect(1, 0, 1, 1);
  //   ctx.fillRect(0, 1, 1, 1);

  //   return Texture.from(canvas);
  // };
  // useEffect(() => {
  //   const texture = createCheckeredTexture();
  //   setCheckeredTexture(texture);
  // }, []);

  // const applyDrawingToLayer = async (app) => {
  //   if (!app || drawingPath.length === 0) return;

  //   const maskGraphics = new Graphics();
  //   const ctx = maskGraphics.context;
  //   console.log(drawingPath);

  //   ctx.beginPath();
  //   ctx.strokeStyle = selectedColor;
  //   ctx.strokeStyle.width = sizeRef.current;

  //   drawingPath.forEach(([x, y], i) => {
  //     if (i === 0) ctx.moveTo(x, y);
  //     else ctx.lineTo(x, y);
  //   });

  //   ctx.stroke(); // Apply stroke
  //   const originalTextureObj = loadedTextures[selectedImageKey][selectedLayer];
  //   if (!originalTextureObj) return;
  //   const { texture: originalTexture } = originalTextureObj;
  //   originalTexture.scaleMode = SCALE_MODES.NEAREST;

  //   // Create a sprite for the original texture
  //   const originalSprite = new Sprite(originalTexture);
  //   const container = new Container();

  //   // Use the mask on the original sprite
  //   if (tool === "erase") {
  //     originalSprite.setMask({
  //       mask: maskGraphics,
  //       inverse: true,
  //     });
  //   }

  //   // Add the original sprite to the container
  //   container.addChild(originalSprite);
  //   if (tool === "draw") {
  //     container.addChild(maskGraphics);
  //   }

  //   // Render the container to the main texture
  //   const renderTexture = RenderTexture.create({
  //     width: originalTexture.width,
  //     height: originalTexture.height,
  //   });
  //   app.renderer.render(container, { renderTexture, clear: true });

  //   // Extract the final image
  //   const newUrl = await app.renderer.extract.base64(renderTexture);
  //   // Now update the state with the new URL string.
  //   setLoadedTextures((prev) => {
  //     const newTextures = [...prev];
  //     newTextures[selectedImageKey] = newTextures[selectedImageKey].map(
  //       (layer, index) =>
  //         index === selectedLayer
  //           ? {
  //               ...layer,
  //               texture: renderTexture,
  //               url: newUrl,
  //             }
  //           : layer
  //     );
  //     return newTextures;
  //   });

  //   // Clear drawing path for next time
  //   setDrawingPath([]);
  // };

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

  const computedWidth = textureWidth * scaleFactor;
  const computedHeight = textureHeight * scaleFactor;
  useEffect(() => {
    console.log("change canvas size");
    if (!canvasRef.current || !appRef.current?.getApplication()) return;
    const app = appRef.current.getApplication();
    app.renderer.resize(computedWidth, computedHeight);
  }, [computedWidth, computedHeight]);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  //
  //
  //

  //

  const ImageComponent = ({ layerIndex, imgIndex }) => {
    const { draw, handlePointerDown, handlePointerMove, handlePointerUp } =
      useDrawing(textureWidth, textureHeight);
    const { app } = useApplication();
    appRef.current = app;
    const graphicsRef = useRef(null);
    console.log(loadedTextures[imgIndex]?.[layerIndex]);

    return (
      <pixiContainer
        key={layerIndex}
        visible={true}
        interactive={
          imgIndex === selectedImageKey && layerIndex === selectedLayer
        }
        interactiveChildren={
          imgIndex === selectedImageKey && layerIndex === selectedLayer
        }
      >
        <pixiSprite
          visible={loadedTextures[imgIndex]?.[layerIndex]?.visible === true}
          texture={loadedTextures[imgIndex]?.[layerIndex]?.texture}
        />
        {imgIndex === selectedImageKey && layerIndex === selectedLayer && (
          <pixiGraphics
            ref={graphicsRef}
            x={0}
            y={0}
            draw={draw}
            interactive={true}
            onPointerDown={(event) =>
              handlePointerDown(event, app, graphicsRef)
            }
            onPointerMove={(event) => handlePointerMove(event, graphicsRef)}
            onPointerUp={() => handlePointerUp(app)}
            hitArea={new Rectangle(0, 0, textureWidth, textureHeight)}
          />
        )}
      </pixiContainer>
    );
  };

  const ContainerComponent = ({ imgIndex, children, containerRefCallback }) => {
    const containerRef = useRef(null);

    const { containerRefs } = useImageContext();
    useEffect(() => {
      if (containerRef.current) {
        containerRefs.current.set(imgIndex, containerRef.current);
        console.log(containerRef.current);
      }
      return () => {
        containerRefs.current.delete(imgIndex); // cleanup
      };
    }, [imgIndex]);

    if (!initialPositionsRef.current.has(imgIndex)) {
      const { width, height } = parentRef.current.getBoundingClientRect();
      const scale = Math.min(width / textureWidth, height / textureHeight);
      const initialX = (width - textureWidth * scale) / 2;
      const initialY = (height - textureHeight * scale) / 2;

      initialPositionsRef.current.set(imgIndex, {
        x: initialX,
        y: initialY,
        scale: scale,
      });
      currentPositionsRef.current.set(imgIndex, {
        x: initialX,
        y: initialY,
        scale: scale,
      });
    }
    const currentPostion = currentPositionsRef.current.get(imgIndex);

    const onWheel = (event) => {
      const container = containerRef.current;
      const initialPos = initialPositionsRef.current.get(imgIndex);
      const zoomFactor = 1.1;
      const parentBounds = parentRef.current.getBoundingClientRect();

      let newScale;

      if (event.deltaY < 0) {
        const localBefore = container.toLocal(event.global);
        newScale = Math.min(container.scale.x * zoomFactor, 5);
        container.scale.set(newScale);
        const localAfter = container.toLocal(event.global);
        container.position.x += (localAfter.x - localBefore.x) * newScale;
        container.position.y += (localAfter.y - localBefore.y) * newScale;
      } else {
        newScale = Math.max(container.scale.x / zoomFactor, initialPos.scale);

        const bounds = container.getLocalBounds();
        const scaledWidth = bounds.width * newScale;
        const scaledHeight = bounds.height * newScale;

        const calculatedPosX =
          scaledWidth + container.position.x > parentBounds.width
            ? container.position.x
            : parentBounds.width - scaledWidth;

        const calculatedPosY =
          scaledHeight + container.position.y > parentBounds.height
            ? container.position.y
            : parentBounds.height - scaledHeight;

        const clampedX = Math.min(initialPos.x, calculatedPosX);
        const clampedY = Math.min(initialPos.y, calculatedPosY);

        container.scale.set(newScale);
        container.position.set(clampedX, clampedY);
      }
      currentPositionsRef.current.set(imgIndex, {
        x: container.position.x,
        y: container.position.y,
        scale: container.scale,
      });
      scaleRef.current = newScale;
    };
    return (
      <pixiContainer
        ref={containerRef}
        key={imgIndex}
        visible={imgIndex === selectedImageKey}
        interactive={true}
        onWheel={onWheel}
        x={currentPostion.x}
        y={currentPostion.y}
        scale={currentPostion.scale}
      >
        {children}
      </pixiContainer>
    );
  };
  if (!texturesLoaded) return <div>Loading...</div>;

  return (
    <div
      ref={parentRef}
      className="col-start-2 col-end-3 row-start-3 row-end-4 overflow-auto flex justify-center items-center"
    >
      <Application resizeTo={parentRef} backgroundColor={0xffffff}>
        {loadedTextures?.map((imageLayers, imgIndex) => (
          <ContainerComponent
            imgIndex={imgIndex}
            containerRefCallback={(ref) =>
              containerRefs.current.set(imgIndex, ref)
            }
          >
            {imageLayers.map((layer, layerIndex) => (
              <ImageComponent layerIndex={layerIndex} imgIndex={imgIndex} />
            ))}
          </ContainerComponent>
        ))}
      </Application>
    </div>
  );
};

export default Canvas;
