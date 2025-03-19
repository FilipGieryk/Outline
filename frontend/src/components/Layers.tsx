import { useEffect, useState } from "react";
import { useImageContext } from "../context/ImageContext";

// img will not show processed image but his chosen layer
// mby no div just img
export const Layers = () => {
  const {
    processedImages,
    selectedImageKey,
    setSelectedLayer,
    selectedLayer,
    colors,
    setSelectedColor,
    loadedTextures,
    sizeRef,
    setColors,
  } = useImageContext();
  return (
    <div className="bg-gray-400 w-full h-full row-start-3 col-start-3 mt-2">
      <div className="bg-amber-100 w-[90%] h-50 m-auto my-4">
        <img
          src={loadedTextures[selectedImageKey]?.[selectedLayer]?.url}
          className="h-full w-full"
        ></img>
      </div>
      <div className="bg-gray-500 h-50">
        {loadedTextures[selectedImageKey]?.map((el, index) => (
          <div onClick={() => setSelectedLayer(index)}>Layer {index}</div>
        ))}
      </div>
      <div className="bg-amber-400 h-50 flex gap-2 p-2">
        {colors.map((el, index) => (
          <div
            className="w-10 h-10"
            style={{ backgroundColor: el }}
            onClick={() => setSelectedColor(el)}
          ></div>
        ))}
      </div>
      <div>
        <input
          type="color"
          // // value={selectedColor}
          onBlur={(e) => {
            setColors((prev) => [...prev, e.target.value]);
            setSelectedColor(e.target.value);
          }}
          className="w-10 h-10 border-none cursor-pointer"
        />
      </div>
      <input
        type="range"
        min={1}
        max={100}
        onChange={(e) => {
          sizeRef.current = e.target.value;
        }}
      ></input>
    </div>
  );
};
