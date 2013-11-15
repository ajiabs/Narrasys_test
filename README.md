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
* `npm install` **NEVER use sudo for a non-global npm install!!**

## Grunt Tasks

Grunt is a task runner system that is used for everything from running the project locally in a browser, to linting and unit tests, to building and packaging the project for deployment. Grunt tasks are defined in Gruntfile.js. Here are a few common tasks:

* `grunt server`: Run project in local browser
	* Use this task for local development. The browser should automatically update as you edit project files, including main.scss and view templates.
* `grunt jshint`: Run jshint on the project
	* Before checking changes into the repo or building, make sure this task is passing.
* `grunt test`: Run unit tests
	* Before checking changes into the repo or building, make sure this task is passing.
* `grunt build`: Build the project to the /dist folder
	* This task will fail the build if jshint or unit tests fail

## Bower

Bower is a javascipt package management system for front-end web applications. All javascript library dependencies (AngularJs, jQuery, etc.) are managed through Bower. Bower keeps the manifest of javascript libraries in the bower.json file. Full documentation on Bower commands and usage can be found on [http://bower.io](http://bower.io).

There is no need to run bower commands, unless you are updating or changing the javascript library dependencies for the project. When you install or remove javascript libraries through bower, they will be added to the app/bower_components folder. Bower can only make modifications to bower.json and to this components folder, so when installing components you will need to manually edit the app/index.html and most likely the karma.conf as well (for unit tests).

Here are a few common bower commands and workflows:

* `bower install`: Installs packages to the app/bower_components directory according to the bower.json manifest.
* `bower update`: Updates the app/bower_components directory according to the bower.json manifest.
* `bower cache clean`: Wipes out the local bower cache. Try this if you are getting errors when running `bower install` or `bower update`.
* `bower search packageName`: Search github for the bower package. Bower will list any explicit bower packages as well as general github repos that match the packageName. `packageName` could be something like `underscore.js`.
* `bower install packageName --save`: Downloads the package to app/bower_components. The `--save` flag tells bower to add the dependency to bower.json.
* `bower uninstall packageName --save`: Removes the package from app/bower_components. The `--save` flag tells bower to remove the dependency from  bower.json.

Note: You can get around using the `bower install packageName` and `bower update packageName` commands by simply editing the bower.json file by hand and then running `bower install` or `bower update`.