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

  get id() {
    return this.model.id;
  }

  attached() {
    console.log(this.element.firstElementChild);

    for(let style in this.model.style) {
      let value = this.model.style[style];
      console.log(style);
      console.log(value);
      switch(style) {
        case 'width':
          console.log(`Changing width to ${value}`);
          this.element.firstElementChild.style.width = value;
          break;
      }
    }
  }

  detached() {

  }
}
