import { useEffect, useState } from "react";
import { useImageContext } from "../context/ImageContext";

import { useSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider } from "@dnd-kit/react";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";
import { RenderTexture } from "pixi.js";

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
    setLoadedTextures,
    appRef,
  } = useImageContext();

  const toggleVisibility = (index) => {
    setLoadedTextures((prevTextures) => {
      const updatedTextures = [...prevTextures];

      const layers = [...updatedTextures[selectedImageKey]];

      layers[index] = {
        ...layers[index],
        visible: !layers[index].visible,
      };

      updatedTextures[selectedImageKey] = layers;

      return updatedTextures;
    });
  };
  const handleLayerDelete = (index) => {
    setLoadedTextures((prevTextures) => {
      const updatedTextures = [...prevTextures];

      const layers = [...updatedTextures[selectedImageKey]];

      const final = layers.filter((el, layerIndex) => layerIndex != index);
      updatedTextures[selectedImageKey] = final;
      return updatedTextures;
    });
  };

  const SortableItem = ({ id, index }) => {
    const sortable = useSortable({
      id,
      index,
      modifiers: [
        RestrictToElement.configure({
          element: document.getElementById("layers"),
        }),
      ],
    });
    return (
      <div
        ref={sortable.ref}
        className={`flex justify-center gap-2 hover:bg-amber-300 ${
          index === selectedLayer ? "bg-red-400" : "bg-transparent"
        }`}
      >
        <div onClick={() => toggleVisibility(index)}>eye</div>
        <p onClick={() => setSelectedLayer(index)}>{id}</p>
        <div onClick={() => handleLayerDelete(index)}>del</div>
      </div>
    );
  };

  const handleAddLayer = async () => {
    const textureRefrence =
      loadedTextures?.[selectedImageKey]?.[selectedLayer].texture;

    const height = textureRefrence.height;
    const width = textureRefrence.width;
    console.log(textureRefrence);

    const newRenderTexture = RenderTexture.create({ width, height });

    const app = appRef.current?.getApplication();
    const newUrl = await app.renderer.extract.base64(newRenderTexture);

    setLoadedTextures((prevTextures) => {
      const updatedTextures = [...prevTextures];
      updatedTextures[selectedImageKey] = [
        ...updatedTextures[selectedImageKey], // Copy existing layers
        {
          texture: newRenderTexture,
          url: newUrl,
          visible: true,
          name: `layer${updatedTextures[selectedImageKey].length}`,
        },
      ];

      return updatedTextures;
    });
  };
  return (
    <div className="bg-gray-400 w-full h-full row-start-3 col-start-3 mt-2">
      <div className="bg-amber-100 w-[90%] h-50 m-auto my-4">
        <img
          src={loadedTextures[selectedImageKey]?.[selectedLayer]?.url}
          className="h-full w-full"
        ></img>
      </div>
      <DragDropProvider
        // collisionDetection={closestCenter}
        // modifiers={[restrictToParentElement]}
        onDragEnd={(event, manager) => {
          const { operation, canceled } = event;
          console.log(operation);
          const targetIndex = operation.target.sortable.previousIndex;
          const initialIndex = operation.target.sortable.initialIndex;
          setSelectedLayer(targetIndex);
          console.log(selectedLayer);
          if (operation.target) {
            setLoadedTextures((prevTextures) => {
              const updatedTextures = [...prevTextures];
              const layers = [...updatedTextures[selectedImageKey]];
              const [movedItem] = layers.splice(initialIndex, 1);
              layers.splice(targetIndex, 0, movedItem);
              updatedTextures[selectedImageKey] = layers;
              setSelectedLayer(targetIndex);
              return updatedTextures;
            });
          }
        }}
      >
        <div
          id="layers"
          className="bg-gray-500 h-50 flex flex-col overflow-auto"
        >
          {loadedTextures[selectedImageKey]?.map((el, index) => (
            <SortableItem key={index} id={el.name} index={index} />
          ))}
          <button onClick={handleAddLayer}>+</button>
        </div>
      </DragDropProvider>

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
        defaultValue={1}
        onChange={(e) => {
          sizeRef.current = Number(e.target.value);
        }}
      ></input>
    </div>
  );
};
