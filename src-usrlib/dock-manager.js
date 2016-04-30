export class DockManager {
  constructor() {

  }

  created(owningView, thisView) {
    this.view = thisView;
    this.parentView = owningView;
    console.log('DockManager created');
    console.log(thisView);
  }

  activate(model) {
    this.model = model;
  }

  get panels() {
    return this.model.panels;
  }

  attached() {
    // At this point, this.dockManagerElement is valid
  }

}
