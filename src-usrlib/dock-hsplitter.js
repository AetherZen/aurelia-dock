import {inject} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
export class DockHorizontalSplitter {
  constructor(element, eventQueue) {
    this.outerElement = element;
    this.eventQueue = eventQueue;
    this.isAttached = false;
    this.mouseSub = null;
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
    if(this.mouseSub) {
      this.mouseSub.dispose();
      this.mouseSub = null;
    }
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

      this.mouseSub = this.eventQueue.subscribe('mouse-events',
        this.mouseEventHandler.bind(this));

      this.eventQueue.publish('layout-manager', { cmd: 'start-mouse'});
     } else {
      this.eventQueue.publish('layout-manager', { cmd: 'stop-mouse'});
      this.mouseSub.dispose();
      this.mouseSub = null;
     }

     this.isDragging = isDragging;
  }

  splitMove(event) {
    if(this.isDragging) {
      // Update the model split based on the original split, the original
      // click position and the new mouse position.
      this.model.split = this.originalSplit + event.clientX - this.startX;
    } else {
      // Publish this event
      this.publishMouse('mouseMove', event);
    }
  }

  publishMouse(cmd, event) {
    this.eventQueue.publish('mouse-events', { cmd: cmd, event: event });
  }


  // Handle mouse events published from DockManager
  mouseEventHandler(data) {
    switch(data.cmd) {
      case 'mouseMove':
        this.splitMove(data.event);
        break;
      case 'mouseOut':
        // Ignore
        break;
      case 'mouseEnd':
        break;
    }
  }
}
