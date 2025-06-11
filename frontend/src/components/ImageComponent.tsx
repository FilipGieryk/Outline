import { useApplication } from "@pixi/react";
import { Rectangle } from "pixi.js";
import { useRef } from "react";
import { useDrawing } from "../hooks/useDrawing";
import { useImageContext } from "../context/ImageContext";

const ImageComponent = ({
  layerIndex,
  imgIndex,
  selectedImageKey,
  selectedLayer,
  loadedTextures,
  textureWidth,
  textureHeight,
}) => {
  const { tool } = useImageContext();

  const { draw, handlePointerDown, handlePointerMove, handlePointerUp } =
    useDrawing(tool, textureWidth, textureHeight);

  const { app } = useApplication();
  const graphicsRef = useRef(null);
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
          onPointerDown={(event) => handlePointerDown(event, app, graphicsRef)}
          onPointerMove={(event) => handlePointerMove(event, graphicsRef)}
          onPointerUp={() => handlePointerUp(app)}
          hitArea={new Rectangle(0, 0, textureWidth, textureHeight)}
        />
      )}
    </pixiContainer>
  );
};

export default ImageComponent;
