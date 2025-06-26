import { useEffect, useState } from "react";
import { loadTexture, loadAllTextures } from "../utils/textureLoader";
import { dbRef } from "../core/indexedDb";
import { useImageContext } from "../context/ImageContext";
import type { LoadedTexture } from "../context/ImageContext";
interface ImageProp {
  url: string;
  name: string;
}

interface UseTextureManagerProps {
  dbReady: boolean;
  processedImages: string[][];
}

export const useTextureManager = ({
  dbReady,
  processedImages,
}: UseTextureManagerProps): {
  loadedTextures: LoadedTexture[][];
  texturesLoaded: boolean;
} => {
  const { setLoadedTextures, loadedTextures } = useImageContext();
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  useEffect(() => {
    if (!dbReady || processedImages[0]?.length !== 0) return;

    const fetchFromDB = async () => {
      try {
        const items = await dbRef.getAllRecords();

        const textures = await Promise.all(
          items.map(async (item) => {
            const imageLayers = await Promise.all(
              item.images.map(async ({ url, name }: ImageProp) => {
                try {
                  const texture = await loadTexture(url, undefined, name);
                  return texture;
                } catch (err) {
                  console.error("Error loading texture from URL:", url, err);
                  return { url, name, texture: null };
                }
              })
            );
            return imageLayers;
          })
        );

        setLoadedTextures(textures);
        setTexturesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch textures from IndexedDB:", error);
      }
    };

    fetchFromDB();
  }, [dbReady, processedImages]);

  useEffect(() => {
    if (!processedImages || processedImages.length === 0) return;

    const loadFromProcessed = async () => {
      try {
        const textures = await loadAllTextures(processedImages);
        setLoadedTextures(textures);
        setTexturesLoaded(true);
      } catch (error) {
        console.error("Failed to load textures from processedImages:", error);
      }
    };

    loadFromProcessed();
  }, [processedImages]);

  useEffect(() => {
    if (!dbReady || !texturesLoaded || loadedTextures.length === 0) return;

    loadedTextures.forEach((imageLayers, imgIndex) => {
      const record = {
        id: imgIndex,
        name: `container-${imgIndex}`,
        images: imageLayers.map(({ url, name }) => ({ url, name })),
        timestamp: Date.now(),
      };

      dbRef
        .putRecord(record)
        .then((id) => console.log(`Record updated with id ${id}`))
        .catch((err) => console.error("Error updating record:", err));
    });
  }, [dbReady, texturesLoaded, loadedTextures]);

  return { loadedTextures, texturesLoaded };
};
