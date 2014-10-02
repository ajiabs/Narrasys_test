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
* `grunt dev`: Run project in local browser, and also runs a continuous PhantomJS test in the background with growler notification.
	* This will probably fail on your machine unless you fiddle around installing growler and etcetera, which I didn't keep track of how I did. Sorry about that.

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

## Release Process

The following steps are required to release a new version:

### Checkout master branch

You should be working out of the master branch when generating new builds. Be sure that you have merged in any feature branches and that master is current.  (You can use the generic "dev" branch for work in progress, or use separate branches for each feature, your preference.)

### Version.txt

Update the app/version.txt file to reflect whatever version we are going to build. Grunt will copy this file to /dist along with the generated build. The file is only for convenience, to make it easy to check which version of the player is currently deployed like this: `http://example.com/version.txt`

### changelog.txt

Update the app/changelog.txt file with a brief description of what has changed.

### Build to /dist

Before building you should be sure to run `grunt jshint` and `grunt test` to make sure linting and unit tests are passing.

Use one of the following commands to generate a new build and output it to the /dist directory. These commands will always replace the current contents of /dist.

- `grunt server:dist` Outputs a new build to /dist and runs server from /dist for local browser testing.
- `grunt build` Outputs a new build to /dist.

*Note that for some reason the `grunt server:dist` command does not always pop open a browser window for you so you may need to do that manually.*

### Push /dist to git

Commit your changes to master and push to the remote as you would any other changes.

### Create a git version tag

Create an annotated version tag and push it to the remote. Commands for doing this are as follows:

- `git tag -a v1.2.3 -m "Commit notes"`
- `git push origin v1.2.3`


### A sample build script which I'm sure you could improve upon

```
#!/bin/bash
cd /Users/daniel/Sites/client;
lastversion=`cat app/version.txt`;
echo "Last version was ${lastversion}.  New version number:";
read newversion;
echo "New version will be ${newversion}";

echo "------------------------------------------------" >> app/changelog.txt;
echo "Changes in ${newversion}:" >> app/changelog.txt;
git log ${lastversion}..HEAD --pretty=%B >> app/changelog.txt;
bbedit app/changelog.txt;

echo "############################################################";
echo "#  Edit changelog, then press a key"; 
echo "############################################################";
read -n 1 -s;

echo "Building...";
echo "${newversion}" > app/version.txt;

grunt build;
echo "############################################################";
echo "#  Now commit the build. Press a key when that's done";
echo "############################################################";
read -n 1 -s;
git tag ${newversion};
git push --tags;
```

### Versions

The following standard incremental version numbering system is being used by convention: **v[major].[minor].[revision]**

- Major: Major refactors, features, and breaking changes (increments reset minor and revision)
- Minor: Changes that ensure backwards compatibility, or minor contract changes (increments reset revision)
- Revision: Bug fixes and changes are always backards compatible and no contract changes (increments reset nothing)

Tagged branches (for demos or pre-release code) may use different standards (side by side uses SxS[major].[minor] for example.)