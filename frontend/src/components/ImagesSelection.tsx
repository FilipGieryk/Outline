import { useEffect } from "react";
import { useImageContext } from "../context/ImageContext";
import { RenderTexture, Sprite, Texture } from "pixi.js";

export const ImagesSelection = () => {
  const {
    loadedTextures,
    setLoadedTextures,
    setSelectedImageKey,
    containerRefs,
    appRef,
  } = useImageContext();

  const createBlankTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000; // Set a reasonable default size
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white"; // Optional: Set a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const baseTexture = Texture.from(canvas);
    return {
      url: canvas.toDataURL(),
      texture: baseTexture,
      name: "layer0",
      visible: true,
    };
  };

  function downloadPixiContainerImage(
    renderer,
    container,
    filename: string = "merged.png"
  ) {
    const bounds = container.getLocalBounds();
    const renderTexture = RenderTexture.create({
      width: bounds.width,
      height: bounds.height,
    });

    const originalScale = container.scale.x;
    const originalPosition = { x: container.x, y: container.y };
    container.position.set(-bounds.x, -bounds.y);
    container.scale.set(1);

    renderer.render(container, { renderTexture });

    container.position.set(originalPosition.x, originalPosition.y);
    container.scale.set(originalScale);
    const canvas = renderer.extract.canvas(renderTexture);

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const deleteImg = (index: number) => {
    const result = confirm("Are you sure?");
    if (result) {
      setLoadedTextures((prev) => prev.filter((_, i) => i !== index));
      setSelectedImageKey(0);
    }
  };

  const NewDrawing = () => {
    const newTexture = createBlankTexture();
    setLoadedTextures((prev) => [...prev, [newTexture]]);
  };
  useEffect(() => {
    if (!loadedTextures || loadedTextures.length === 0) {
      setLoadedTextures([[createBlankTexture()]]);
    }
  }, [loadedTextures, setLoadedTextures]);
  return (
    <div className="bg-[#2f2f35] w-full h-full row-start-2 col-start-1 col-end-4 flex flex-wrap gap-4 p-2">
      {loadedTextures?.length > 0 ? (
        loadedTextures.map((imageLayers, index) => (
          <div key={index} className="relative w-32 h-30">
            <img
              src={imageLayers[0]?.url} // Display stored image URL
              alt={`Processed ${index}`}
              className="w-full h-full object-cover border-2 rounded hover:scale-105 transition-transform"
              onClick={() => setSelectedImageKey(index)}
            />
            <button
              onClick={() => {
                const container = containerRefs.current.get(index);
                const app = appRef.current;
                if (container) {
                  downloadPixiContainerImage(
                    app.renderer,
                    container,
                    `image-${index}.png`
                  );
                }
              }}
              className="absolute top-1 right-5 text-black px-2 py-0.5 text-xs cursor-pointer"
            >
              s
            </button>
            <button
              onClick={() => deleteImg(index)}
              className="absolute top-1 right-1 text-black px-2 py-0.5 text-xs cursor-pointer"
            >
              x
            </button>
          </div>
        ))
      ) : (
        <p className="text-white">No images uploaded yet.</p>
      )}
      <div
        className="w-30 h-30 flex justify-center items-center bg-gray-300 rounded cursor-pointer hover:scale-102"
        onClick={NewDrawing}
      >
        +
      </div>
    </div>
  );
};
