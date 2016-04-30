import {inject} from 'aurelia-framework';

@inject(Element)
export class DockSplitter {
  constructor(element) {
    this.element = element;
  }

  created(owningView, thisView) {
    this.view = thisView;
    this.parentView = owningView;
    this.view.viewModel = this;
  }

  activate(model) {
    this.model = model;
    this.myRef = this.model.ref;
  }

  get panels() {
    return this.model.panels;
  }

  attached() {
    console.log("Attached to splitter");
    console.log(this.element);
    console.log(this.parentView.viewModel);
  }

  detached() {

  }
}
