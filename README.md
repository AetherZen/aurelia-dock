# Aurelia Docking Layout Manager

Originally inspired by other docking layout managers like  [DockSpawn ](http://www.dockspawn.com/), and [Web Cabin Docker (wcDocker)](http://docker.webcabin.org/)

The goal of this layout manager is to make it easier to implement dockable views with each container having draggable tabs, a lot like Eclipse and the original wxWidgets version of Zen Studio.

A major difference between this library and other layout managers is that this layout manager is purely data driven.

For example, a JSON model like the one shown below will create a horizontal splitter with two containers, each of which have an editor view.  Once the application is started, simply manipulating the model will automatically update the view (and vice versa).
```
var global_workspace = {
  panels: [
    {
      view: "aurelia-dock/dock-hsplitter",
      split: 200,
      left:
        {
          view: "app-zen-studio/views/editor-view",
          message: "Hello, world 2!"
        },
      right:
        {
          view: "app-zen-studio/views/editor-view",
          message: "Hello, world 3!"
        }
    }
  ]
};
```

I've implemented this using Aurelia data binding and composition elements.

This library is NOT complete.  If you're interested in contributing, please contact me via [![chat at https://gitter.im/aetherzen/discuss](https://badges.gitter.im/aetherzen/Discuss.svg)](https://gitter.im/aetherzen/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge).
