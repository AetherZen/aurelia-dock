import {inject} from 'aurelia-framework';

@inject(Element)
export class DockHorizontalSplitter {
  constructor(element) {
    this.outerElement = element;
    this.isAttached = false;
  }

  created(owningView, thisView) {
    this.view = thisView;
    this.parentView = owningView;
    this.view.viewModel = this;
  }

  activate(model) {
    this.model = model;
  }

  attached() {
    // When the view is attached, squirrel away a few commonly used elements
    this.isAttached = true;
    this.element = this.outerElement.firstElementChild;
    this.leftElement = this.element.children[0];
    this.splitElement = this.element.children[1];
    this.rightElement = this.element.children[2];
  }

  detached() {
    this.isAttached = false;
  }

  get leftStyle() {
    if(this.isAttached) {
      return "width: " + this.widthLeft + "px;";
    }
    return "";
  }

  get rightStyle() {
    if(this.isAttached) {
      return "width: " + this.widthRight + "px;";
    }
    return "";
  }

  get widthLeft() {
    // model.split is the number of px for the left side
    // TODO I don't really like this implementation, but I'll have a better
    // idea when I get further along.
    return this.model.split;
  }

  get widthRight() {
    return this.element.offsetWidth - this.widthLeft - this.splitElement.offsetWidth;
  }

  /*
   *
   * Split handlers
   *
   */
   splitClick(isDragging, event) {
     if(isDragging) {
       // Save the current split position and the position where the mouse
       // was clicked (in client coordinates);
       this.originalSplit = this.model.split;
       this.startX = event.clientX;
     }

     this.isDragging = isDragging;
   }

   splitMove(event) {
     if(this.isDragging) {
       // Update the model split based on the original split, the original
       // click position and the new mouse position.
       this.model.split = this.originalSplit + event.clientX - this.startX;
     }
   }
}
