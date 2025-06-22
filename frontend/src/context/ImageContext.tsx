import { createContext, useState, useContext, useRef, ReactNode } from "react";

interface LoadedTexture {
  name: string;
  texture: any;
  url: string;
  visible: boolean;
}

interface ImageContextType {
  processedImages: string[][];
  setProcessedImages: React.Dispatch<React.SetStateAction<string[][]>>;

  selectedImageKey: number;
  setSelectedImageKey: React.Dispatch<React.SetStateAction<number>>;

  selectedLayer: number;
  setSelectedLayer: React.Dispatch<React.SetStateAction<number>>;

  loadedTextures: LoadedTexture[][];
  setLoadedTextures: React.Dispatch<React.SetStateAction<LoadedTexture[][]>>;

  containerRefs: React.MutableRefObject<Map<any, any>>;

  tool: string;
  setTool: React.Dispatch<React.SetStateAction<string>>;

  sizeRef: React.MutableRefObject<number>;

  appRef: React.MutableRefObject<any>;

  colors: string[];
  setColors: React.Dispatch<React.SetStateAction<string[]>>;

  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [processedImages, setProcessedImages] = useState<string[][]>([[]]);
  const [selectedImageKey, setSelectedImageKey] = useState<number>(0);
  const [selectedLayer, setSelectedLayer] = useState<number>(0);
  const [loadedTextures, setLoadedTextures] = useState<LoadedTexture[][]>([]);
  const containerRefs = useRef(new Map());
  const [tool, setTool] = useState<string>("draw");
  const sizeRef = useRef<number>(1);
  const appRef = useRef<any>(null);
  const [colors, setColors] = useState<string[]>([
    "#000000",
    "#ff0000",
    "#008000",
    "#0000ff",
  ]);
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);
  return (
    <ImageContext.Provider
      value={{
        processedImages,
        setProcessedImages,
        selectedImageKey,
        setSelectedImageKey,
        // toolRef,
        tool,
        setTool,
        selectedLayer,
        setSelectedLayer,
        colors,
        setSelectedColor,
        selectedColor,
        loadedTextures,
        setLoadedTextures,
        sizeRef,
        setColors,
        appRef,
        containerRefs,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
