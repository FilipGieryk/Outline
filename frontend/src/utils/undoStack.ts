export type UndoStep = {
  layerIndex: number;
  url: string;
};

export class UndoStack {
  history: UndoStep[];
  index: number;

  constructor(initialStep: UndoStep) {
    this.history = [initialStep];
    this.index = 0;
  }

  get current(): UndoStep {
    return this.history[this.index];
  }

  add(step: UndoStep) {
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(step);
    this.index++;
  }

  undo() {
    if (this.canUndo()) this.index--;
  }

  redo() {
    if (this.canRedo()) this.index++;
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.history.length - 1;
  }
}
