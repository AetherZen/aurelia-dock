export class DockLeft {
  constructor() {

  }

  created(owningView, thisView) {
    this.view = thisView;
    this.parentView = owningView;
    console.log('DockLeft created');
    console.log(thisView);
  }

  activate(model) {
    this.model = model;
    console.log('DockLeft activated');
    console.log(model.contents);
  }

  attached() {
  }

  detached() {
    
  }
}
