import { useEffect } from "react";
import { useImageContext } from "../context/ImageContext";
import { createBlankTexture } from "../utils/Canvas";
import { downloadPixiContainerImage } from "../utils/pixiExport";

export const ImagesSelection = () => {
  const {
    loadedTextures,
    setLoadedTextures,
    setSelectedImageKey,
    containerRefs,
    appRef,
  } = useImageContext();

  const deleteImg = (index: number) => {
    const result = confirm("Are you sure?");
    if (result) {
      setLoadedTextures((prev) => prev.filter((_, i) => i !== index));
      setSelectedImageKey(0);
    }
  };

  const NewDrawing = () => {
    const newTexture = createBlankTexture();
    if (!newTexture) return;
    setLoadedTextures((prev) => [...prev, [newTexture]]);
  };

  useEffect(() => {
    if (!loadedTextures || loadedTextures.length === 0) {
      const newTexture = createBlankTexture();
      if (!newTexture) return;
      setLoadedTextures([[newTexture]]);
    }
  }, [loadedTextures, setLoadedTextures]);

  return (
    <div className="bg-[#2f2f35] w-full h-full row-start-2 col-start-1 col-end-4 flex flex-wrap gap-4 p-2">
      {loadedTextures?.length > 0 ? (
        loadedTextures.map((imageLayers, index) => (
          <div key={index} className="relative w-32 h-30">
            <img
              src={imageLayers[0]?.url}
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
