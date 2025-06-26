import { useEffect, useRef, useState, type ReactNode } from "react";
import { extend, Application, useApplication } from "@pixi/react";
import {
  Container,
  Sprite,
  Graphics,
  Rectangle,
  TilingSprite,
  FederatedPointerEvent,
  FederatedWheelEvent,
} from "pixi.js";

import { useImageContext } from "../context/ImageContext";

import { useDrawing } from "../hooks/useDrawing";
import { useTextureManager } from "../hooks/useTextureManager";
import { useDbReady } from "../hooks/useDbReady";

extend({ Container, Sprite, Graphics, TilingSprite });

export interface ImageProp {
  url: string;
  name: string;
}

const Canvas = () => {
  const { processedImages, selectedImageKey, selectedLayer, appRef } =
    useImageContext();
  const dbReady = useDbReady();

  const { loadedTextures, texturesLoaded } = useTextureManager({
    dbReady,
    processedImages,
  });
  const parentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef(null);

  const [scaleFactor, setScaleFactor] = useState(1);
  const originalTextureObj = loadedTextures[selectedImageKey]?.[selectedLayer];
  const textureWidth = originalTextureObj?.texture?.width || 2000;
  const textureHeight = originalTextureObj?.texture?.height || 1000;
  const initialPositionsRef = useRef(new Map());
  const currentPositionsRef = useRef(new Map());
  const scaleRef = useRef(1);

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
    if (!canvasRef.current || !appRef.current?.getApplication()) return;
    const app = appRef.current.getApplication();
    app.renderer.resize(computedWidth, computedHeight);
  }, [computedWidth, computedHeight]);

  interface ImageComponentProps {
    layerIndex: number;
    imgIndex: number;
  }

  const ImageComponent: React.FC<ImageComponentProps> = ({
    layerIndex,
    imgIndex,
  }) => {
    const { draw, handlePointerDown, handlePointerMove, handlePointerUp } =
      useDrawing(textureWidth, textureHeight);
    const { app } = useApplication();
    appRef.current = app;
    const graphicsRef = useRef<Graphics | null>(null);
    console.log(loadedTextures);
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
            onPointerDown={(event: FederatedPointerEvent) =>
              handlePointerDown(event, app, graphicsRef.current)
            }
            onPointerMove={(event: FederatedPointerEvent) =>
              handlePointerMove(event, graphicsRef.current)
            }
            onPointerUp={() => handlePointerUp(app)}
            hitArea={new Rectangle(0, 0, textureWidth, textureHeight)}
          />
        )}
      </pixiContainer>
    );
  };

  interface ContainerComponentProps {
    imgIndex: number;
    children: ReactNode;
  }

  const ContainerComponent: React.FC<ContainerComponentProps> = ({
    imgIndex,
    children,
  }) => {
    const containerRef = useRef<Container>(null);

    const { containerRefs } = useImageContext();
    useEffect(() => {
      if (containerRef.current) {
        containerRefs.current.set(imgIndex, containerRef.current);
      }
      return () => {
        containerRefs.current.delete(imgIndex); // cleanup
      };
    }, [imgIndex]);

    if (!initialPositionsRef.current.has(imgIndex)) {
      if (!parentRef.current) return;
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

    const onWheel = (event: FederatedWheelEvent) => {
      const container = containerRef.current;
      if (!container || !parentRef.current) return;
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
  console.log(texturesLoaded);
  console.log(loadedTextures);
  if (!texturesLoaded) return <div>Loading...</div>;
  return (
    <div
      ref={parentRef}
      className="col-start-2 col-end-3 row-start-3 row-end-4 overflow-auto flex justify-center items-center"
    >
      <Application resizeTo={parentRef} backgroundColor={0xffffff}>
        {loadedTextures?.map((imageLayers, imgIndex) => (
          <ContainerComponent imgIndex={imgIndex}>
            {imageLayers.map((_, layerIndex) => (
              <ImageComponent layerIndex={layerIndex} imgIndex={imgIndex} />
            ))}
          </ContainerComponent>
        ))}
      </Application>
    </div>
  );
};

export default Canvas;
