import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class DockManager {
  constructor(eventQueue) {
    this.eventQueue = eventQueue;
    this.isPublishingMouse = false;
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

    // Reset mouse publishing flag
    // TODO Should this be reference counted?  Probably, but I'll implement that
    // later if necessary.
    this.isPublishingMouse = false;
    // Subscribe to layout manager event queue
    this.subscription = this.eventQueue.subscribe('layout-manager', msg => {
      switch(msg.cmd) {
        case 'start-mouse':
          this.isPublishingMouse = true;
          break;
        case 'stop-mouse':
          this.mouseEnd();
          break;
      }
    });
  }

  detached() {
    this.subscription.dispose();
  }

  /*
   * Mouse event handling
   */

  mouseMove(event) {
    if(this.isPublishingMouse) {
      this.publishMouse('mouseMove', event);
    }
  }

  mouseOut(event) {
    if(this.isPublishingMouse) {
      this.publishMouse('mouseOut', event);
      // TODO Should we stop publishing events when this happens?
    }
  }

  mouseEnd() {
    this.isPublishingMouse = false;
    this.publishMouse('mouseEnd', null);
  }

  publishMouse(cmd, event) {
    this.eventQueue.publish('mouse-events', { cmd: cmd, event: event });
  }
}
