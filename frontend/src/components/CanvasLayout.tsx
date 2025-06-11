import { Application } from "@pixi/react";

const CanvasLayout = ({ children, parentRef }) => (
  <div
    ref={parentRef}
    className="col-start-2 col-end-3 row-start-3 row-end-4 overflow-auto flex justify-center items-center"
  >
    <Application resizeTo={parentRef} backgroundColor={0xffffff}>
      {children}
    </Application>
  </div>
);

export default CanvasLayout;
