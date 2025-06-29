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
  type BLEND_MODES,
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

interface ImageComponentProps {
  layerIndex: number;
  imgIndex: number;
}

interface ContainerComponentProps {
  imgIndex: number;
  children: ReactNode;
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
  const [scaleFactor, setScaleFactor] = useState(1);
  const originalTextureObj = loadedTextures[selectedImageKey]?.[selectedLayer];
  const textureWidth = originalTextureObj?.texture?.width || 2000;
  const textureHeight = originalTextureObj?.texture?.height || 1000;
  const initialPositionsRef = useRef(new Map());
  const currentPositionsRef = useRef(new Map());
  const scaleRef = useRef(1);

  // useeffect that need any usestate so it rerender
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

  const ImageComponent: React.FC<ImageComponentProps> = ({
    layerIndex,
    imgIndex,
  }) => {
    const { draw, handlePointerDown, handlePointerMove, handlePointerUp } =
      useDrawing(textureWidth, textureHeight);
    const { app } = useApplication();
    appRef.current = app;
    const graphicsRef = useRef<Graphics | null>(null);
    const spriteRef = useRef(null);
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
          ref={spriteRef}
          visible={loadedTextures[imgIndex]?.[layerIndex]?.visible === true}
          texture={loadedTextures[imgIndex]?.[layerIndex]?.texture}
        />
        {imgIndex === selectedImageKey && layerIndex === selectedLayer && (
          <pixiContainer>
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
          </pixiContainer>
        )}
      </pixiContainer>
    );
  };

  const ContainerComponent: React.FC<ContainerComponentProps> = ({
    imgIndex,
    children,
  }) => {
    const containerRef = useRef<Container>(null);
    const { containerRefs } = useImageContext();

    const prevSizeRef = useRef<DOMRect | null>(null);
    useEffect(() => {
      if (!parentRef.current) return;

      const observer = new ResizeObserver(() => {
        const parentBounds = parentRef.current?.getBoundingClientRect();
        const container = containerRef.current;
        if (!container || !parentBounds) return;

        const posRef = currentPositionsRef.current.get(imgIndex);
        if (!posRef) return;

        const { x: oldX, y: oldY, scale } = posRef;

        if (!prevSizeRef.current) {
          prevSizeRef.current = parentBounds;
          return;
        }

        const dx = parentBounds.width - prevSizeRef.current.width;
        const dy = parentBounds.height - prevSizeRef.current.height;

        // Move image only by the added/removed space (half on each side)
        const newX = oldX + dx / 2;
        const newY = oldY + dy / 2;

        container.position.set(newX, newY);
        container.scale.set(scale);

        currentPositionsRef.current.set(imgIndex, { x: newX, y: newY, scale });

        // Update previous size
        prevSizeRef.current = parentBounds;
      });

      observer.observe(parentRef.current);

      return () => observer.disconnect();
    }, [imgIndex]);

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
        newScale = Math.min(container.scale.x * zoomFactor, 20);
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
        scale: newScale,
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
  if (!texturesLoaded || !originalTextureObj) return <div>Loading...</div>;
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
