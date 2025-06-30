import Canvas from "../components/Canvas";

import { Layers } from "../components/Layers";
import { Options } from "../components/Options";
import { Tools } from "../components/Tools";
import { ImagesSelection } from "../components/ImagesSelection";
import { useEffect } from "react";

export const DrawingPage = () => {
  return (
    <div className="grid h-full w-full grid-rows-[5%_15%_75%] grid-cols-[4%_80%_16%] gap-x-2 overflow-hidden">
      <Options />
      <ImagesSelection />
      <Tools />
      <Canvas />
      <Layers />
    </div>
  );
};
