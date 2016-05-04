import {inject} from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(Element, EventAggregator)
// TODO There's a lot in common between DockHorizontalSplitter and
// DockVerticalSplitter; refactor to use a base class if that makes
// sense after they're both fully implemented.
export class DockVerticalSplitter {
  constructor(element, eventQueue) {
    this.outerElement = element;
    this.eventQueue = eventQueue
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
    this.topElement = this.element.children[0];
    this.splitElement = this.element.children[1];
    this.bottomElement = this.element.children[2];
  }

  detached() {
    this.isAttached = false;
    if(this.mouseSub) {
      this.mouseSub.dispose();
      this.mouseSub = null;
    }
  }

  get topStyle() {
    if(this.isAttached) {
      return "height: " + this.heightTop + "px;";
    }
    return "";
  }

  get bottomStyle() {
    if(this.isAttached) {
      return "height: " + this.heightBottom + "px;";
    }
    return "";
  }

  get heightTop() {
    // model.split is the number of px for the top panel
    // TODO I don't really like this implementation, but I'll have a better
    // idea when I get further along.
    return this.model.split;
  }

  get heightBottom() {
    return this.element.offsetHeight - this.heightTop - this.splitElement.offsetHeight;
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
      this.startY = event.clientY;

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
      this.model.split = this.originalSplit + event.clientY - this.startY;
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
