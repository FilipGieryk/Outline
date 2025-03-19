import { useEffect } from "react";
import { useImageContext } from "../context/ImageContext";
import { Texture } from "pixi.js";

export const ImagesSelection = () => {
  const { loadedTextures, setLoadedTextures, setSelectedImageKey } =
    useImageContext();

  const createBlankTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300; // Set a reasonable default size
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white"; // Optional: Set a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const baseTexture = Texture.from(canvas);
    return { url: canvas.toDataURL(), texture: baseTexture };
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
    <div className="bg-gray-500 w-full h-full row-start-2 col-start-1 col-end-4 flex">
      {loadedTextures?.length > 0 ? (
        loadedTextures.map((imageLayers, index) => (
          <img
            key={index}
            src={imageLayers[0]?.url} // Display stored image URL
            alt={`Processed ${index}`}
            className="m-2 w-30 h-30 border-2 rounded"
            onClick={() => setSelectedImageKey(index)}
          />
        ))
      ) : (
        <p className="text-white">No images uploaded yet.</p>
      )}
      <div
        className="w-30 h-30 flex justify-center items-center bg-gray-300 rounded cursor-pointer"
        onClick={NewDrawing}
      >
        +
      </div>
    </div>
  );
};
