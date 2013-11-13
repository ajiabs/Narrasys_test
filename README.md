# In The Telling Player 3

Stack:

* [AngularJS](http://angularjs.org/) (JavaScript Framework)
* [Yeoman](http://yeoman.io/) (Workflow Generator)
* [Bower](http://bower.io/) (Package Management)
* [Grunt](http://gruntjs.com/) (Project Build Tasks)

## Project Dependencies

**This step only needs to be performed a single time for your machine.**

For local development, testing, and building, your system must have the following dependencies installed and running:

* [Node.js](http://nodejs.org/)

Yeoman, Bower, and Grunt are all Node.js applications that need to be installed globally via the node.js package manager (npm).

* `npm install -g yo grunt-cli bower` (Build Tools)
* `npm install -g generator-angular` (Yeoman Generator)

If you get errors you can retry the command(s) using sudo.

## Project Setup

Install the required Grunt packages for the project, specified in the project's package.json file:

* cd to the root project directory
* `npm install` **NEVER use sudo for a non-global npm install!**

## Grunt Tasks

* `grunt server`: Run project in local browser
  * Use this task for local development. The browser should automatically update as you edit project files, including main.scss and view templates.
* `grunt server:dist`: Build project and run it in local browser
  * Use this task to view the build locally before releasing. This task will not liveupdate the browser like the `grunt server` task will.
* `grunt jshint`: Run jshint on the project
* `grunt test`: Run unit tests
* `grunt build`: Build the project and export to the /dist folder
* `grunt`: Run jshint, test, and build the project

These tasks and others are defined in the project's Gruntfile.js.

## Bower Dependencies

Bower dependencies (specified in bower.json) have been included in the app/bower_components folder, so that a `bower install` on a fresh repo cannot unexpectedly break the app due to breaking changes of external dependenices like angular, jquery, etc. Bower dependencies should still be updated occasionally but this is an explicity step that needs to be done by a developer, and any subsequent breakages in unit tests or the app need to be addressed by the updater.

To update the bower dependencies:

* cd to the root project directory
* `bower update`