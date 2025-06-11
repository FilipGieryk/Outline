import { useRef } from "react";

const ContainerComponent = ({
  imgIndex,
  children,
  textureWidth,
  textureHeight,
  parentRef,
  initialPositionsRef,
  currentPositionsRef,
  scaleRef,
  selectedImageKey,
}) => {
  const containerRef = useRef(null);

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
    if (!container) return;
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
export default ContainerComponent;
