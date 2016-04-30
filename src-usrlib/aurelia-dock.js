import {Point} from './dock-utils.js'

export class DockManager {
  constructor(element) {
    if (element === undefined)
        throw new Error('Invalid Dock Manager element provided');

    this.element = element;

    this.defaultDialogPosition = new Point(0, 0);
  }
}
