
# Narrasys Client App

## Browsers support

| [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/opera.png" alt="Opera" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Opera | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari-ios.png" alt="iOS Safari" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome-android.png" alt="Chrome for Android" width="16px" height="16px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome for Android |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions| last 2 versions

## Global Dependencies

- node >= 7.5.0
- NPM or yarn ([reccommend yarn](https://yarnpkg.com/en/docs/install#alternatives-tab))

### Code style

All new code should conform to the [airbnb javascript style guide.](https://github.com/airbnb/javascript)
As there is a mix of legacy code with more recent code, IDE's / code editors can be configured to use this project's
TSLint config to aid in enforcing of the style guide above.
AngularJS conventions are mostly inline with the [Todd Motto AngularJS style guide](https://github.com/toddmotto/angularjs-styleguide/tree/master/typescript) (Typescript version).

### General architecture notes

narrasys.com uses a client side MVC (written in angularjs 1.x), which is served statically via nginx, which proxies
the relevant requests to a rails API server. The database is Mongo. Hardware runs on AWS, the repositories are stored on github.


### Setup instructions

The scope of these docs pertains to the client side development toolchain only.
These docs assume that the relevant components (mongo / rails / nginx / hosts file) for 
access the server side of the stack have already been setup.

#### Install client dependencies

Use NPM or Yarn to read the package.json file to install the dependencies

    npm install
    
    -- or --
    
    yarn
    
#### Available NPM scripts:

The following can be found in the 'scripts' section of the package.json file.
Currently webpack is configured to output the contents of a build to the <code>tmp</code>
directory, or <code>dist</code> directory for production builds. (*nginx should be configured to serve static assets from this location, and proxy 
necessary requests to the rails server.)
    
    npm run start

Used when doing client side dev work. Runs wepback in watch mode and outputs unminified build with inline source maps.
 
      npm run prod
      npm run prod:local
      npm run prod:watch
      
      
Use to create a minified production build, with app and vendor bundles. the :watch and :local
variants are used to debugging production builds locally. prod:local will not output the
source maps in a separate directory. prod:watch will rebundle on file edits.
 
### Client utils
 
 The <code>utils</code> directory contains three tools to help automate common
 client side processes. <code>episode-styles-generator</code> is used in tandem
 producers to create scss for a new client theme. <code>itt-releaser</code> is used
 to automate the client side release process. <code>template-seeder</code> is used
 in tandem with <code>episode-styles-generator</code> to create a reference to the 
 client template in the database. 
    
    
### Create a Release with <code>itt-releaser</code>

1. start on the branch where you intend to create the build; e.g. a feature branch or dev
2. cd into <code>/utils/itt-releaser</code> and invoke index.js


    node index.js

    

3. Follow the prompts 
4. Provide a diff between versions on github for review.
