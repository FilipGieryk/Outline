import React, { createContext, useState, useContext, useRef } from "react";

const ImageContext = createContext();

export const useImageContext = () => {
  return useContext(ImageContext);
};

export const ImageProvider = ({ children }) => {
  const [processedImages, setProcessedImages] = useState([[]]);
  const [selectedImageKey, setSelectedImageKey] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [loadedTextures, setLoadedTextures] = useState([]);
  // const toolRef = useRef("draw");
  const containerRefs = useRef(new Map());
  const [tool, setTool] = useState("draw");
  const sizeRef = useRef(1);
  const appRef = useRef(null);
  const [colors, setColors] = useState([
    "#000000",
    "#ff0000",
    "#008000",
    "#0000ff",
  ]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
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
