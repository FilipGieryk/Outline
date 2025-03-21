import { useEffect, useState } from "react";
import { useImageContext } from "../context/ImageContext";
import { DndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/react/sortable";
import { DragDropProvider } from "@dnd-kit/react";

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
  } = useImageContext();

  const SortableItem = ({ id, index }) => {
    const sortable = useSortable({ id, index });
    return (
      <div
        ref={sortable.ref}
        className="item"
        onClick={() => setSelectedLayer(index)}
      >
        Item {id}
      </div>
    );
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
        onDragEnd={(event, manager) => {
          const { operation, canceled } = event;
          // if (canceled) {
          //   console.log("dragCanceled");
          //   return;
          // }
          if (operation.target) {
            console.log(
              `Dropped ${operation.source.id} onto ${operation.target.id}`
            );
            console.log(operation.target.sortable.previousIndex);
            setLoadedTextures(
              (prevTextures) => {
                const updatedTextures = [...prevTextures];
                const layers = [...updatedTextures[selectedImageKey]];
                const [movedItem] = layers.splice(operation.source.id, 1);

                // Insert the moved item at the target position
                layers.splice(
                  operation.target.sortable.previousIndex,
                  0,
                  movedItem
                );

                // Update the layers array for the specific imageKey
                updatedTextures[selectedImageKey] = layers;
                return updatedTextures;
              }
              // setLoadedTextures();
              // setItems((items) => move(items, event));
            );
          }
        }}
      >
        <div className="bg-gray-500 h-50">
          {loadedTextures[selectedImageKey]?.map(
            (el, index) => (
              <SortableItem key={index} id={index} index={index} />
            )
            // <div onClick={() => setSelectedLayer(index)}>Layer {index}</div>
          )}
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
