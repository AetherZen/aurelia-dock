export class DockManager {
  constructor() {

  }

  created(owningView, thisView) {
    this.view = thisView;
    this.parentView = owningView;
    this.view.viewModel = this;
  }

  activate(model) {
    this.model = model;
  }

  get panels() {
    return this.model.panels;
  }

  attached() {
    // At this point, ref is valid
  }

}
