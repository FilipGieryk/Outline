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
              onClick={() =>
                setLoadedTextures((prev) => prev.filter((_, i) => i !== index))
              }
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
