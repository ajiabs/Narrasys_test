# In The Telling Story

## GETTING STARTED

### Other documentation

API documentation: 
http://developers.inthetelling.com

Documentation of (current) template system:
https://docs.google.com/document/d/1WR9UnJIXZrNMwLqkf8GGw6_5-OwuQrZzJAxImxWC7O0 

Planning and design documents for switching to narratives:
https://docs.google.com/document/d/19PViWhOGfARx4iq9b67G3sIiGAjswr6o9b7oOUhzMug
https://docs.google.com/document/d/1ZZK0-1KqvSJYrxedw5WThKbHdNLct65T4x6SIRuzjmY 

Narrative implementation - timeline conversions:
https://docs.google.com/document/d/1Q-VP_IRDX81fdGYvb67LxqJ0rsfANes3xfZ5LJCqWi4/


Planned UI update wireframes:
https://drive.google.com/drive/folders/0B4YqsTGuKs4yRnZjX3dJTHZPNk0
(See the description on each image in this folderfor more info -- click the "details" icon when viewing an image in gdrive)



### ITT Jargon

* Narrative: a playlist containing timelines
* Timeline: One continuous playback within the player. Currently consists of a single video stream in a single episode, but in the planned implementation a timeline could contain a sequence of segments of multiple episodes / master assets
* Episode: A collection of events (content items and scenes) synchronized with a single video stream
* Master asset: the video stream for an episode. 
* Scene: A template for a full-screen layout of content items and the master asset
* Content item: A link, bit of text, image, etc attached to an episode.
* Transmedia: A marketing term for content types which are not transcript or text annotations


### Build, locally run client code

See the README for basic installation info.

`grunt server` for routine development.
`grunt server:dist` lets you test local code as compiled and minimized for the server.
`grunt test` runs the unit tests once.
`grunt dev` runs unit tests continuously in the background, and is configured to send OSX notifications via <a href="http://growl.info">growl</a>, if you have it installed.

Do simple patches in the `dev` branch, and more complicated changes in their own dedicated git branches. Test, merge into dev, test again.  If all goes well, then you can merge into master, assign a version number, and deploy -- see "Tagging and deploying" below.




### Build, locally run server instance

API endpoint documentation (somewhat out of date, but a start) is at https://developers.inthetelling.com 


### Test locally or against specific servers

You can edit config.js to point your local code at our various database servers. (Use great care when testing against the production server; changes you make to episodes WILL be visible to the world.)

(To get access to the servers, you'll need admin accounts on each and an IP address rule -- ask Bill for these.  If you run local code via http://client.dev/ you can skip the IP address rule, because an exception is already set up for that fake domain name.)

This is my Apache setup for handling this (on OSX) -- this may or may not be useful to you.  (By default the rails server runs on port 3000, and grunt dev on port 9000):
````
<VirtualHost *:80>
	ServerName client.dev
	ProxyPass /v3 http://127.0.0.1:3000/v3
	ProxyPass /v2 http://127.0.0.1:3000/v2
	ProxyPass /v1 http://127.0.0.1:3000/v1
	ProxyPass /users/ http://127.0.0.1:3000/users/
	ProxyPass /auth/ http://127.0.0.1:3000/auth/
	ProxyPass /login http://127.0.0.1:3000/login
	ProxyPass /logout http://127.0.0.1:3000/logout
	ProxyPass /signup http://127.0.0.1:3000/signup
	ProxyPass /show_user http://127.0.0.1:3000/show_user
	ProxyPass /pages http://127.0.0.1:3000/pages
	ProxyPass /oauth2 http://127.0.0.1:3000/oauth2
	ProxyPass / http://127.0.0.1:9000/
</VirtualHost>
````
...and add `127.0.0.1 client.dev` to `/etc/hosts`.

### Tagging and deploying

This shell script is hacky and ugly, but it works. Such is the nature of shell scripts.  Run this against the master branch, after your changes have been tested and merged in, then let Bill know the version number you assigned so he can deploy to each server in turn:


````
#!/bin/bash


cd /Users/daniel/Sites/client; # Change this to the location of your local repo
find . -name "*.orig" -exec rm {} \;
lastversion=`cat app/version.txt`;

echo "Last version was ${lastversion}.  New version number:";
read newversion;

echo "New version will be ${newversion}";

# This is a stupid way to prevent myself from checking in a bad config file -- just keep a pristine copy elsewhere and copy it into master every time:
echo "resetting config.js...";
cp /Users/daniel/bin/clean-config.js app/config.js

echo "Building...";
echo "${newversion}" > app/version.txt;
grunt build;

echo "############################################################";
echo "#  If all went well, press a key to commit & push to server.";
echo "############################################################";
read -n 1 -s;

git add --all .
git commit -m "build ${newversion}"
git push
git tag ${newversion};
git push --tags;

````

## DESIGNER

### Overview

The template system controlling the appearance of episodes, scenes, and content items has a generally cascading structure (styles applied to a content item will override those set for the scene, which will override those set for the episode.

It's important to note that the template system is well overdue for a refactor (the styles-refactor branch has the work in progress towards this end) -- try to avoid adding too many template in the existing system, as it will only increase the amount of work involved in migrating existing sites to the new template system.


Also worth noting:  ideally all the templates would be totally compatible with one another, and you'd be able to mix and match any color option with any typography option with any transition with etc.; and the CSS for each type of styling would be segregated into its own file (color options in colors.css, transitions in transitions.css, and so on.)  In practice, a number of the customer-specific episode templates (especially those created after the replacement template system was well underway) do not support some of the secondary options, and all the related CSS is lumped into episode.css.


### Icons

Many (not all) of the icons used in the player interface are part of a custom font generated using http://icomoon.io.
The font itself is contained in the source/ directory, along with a map of the codepoints.
This has proved to be something of a hassle, and was probably a premature bandwidth optimization. It might almost be
easier to replace it with a set of separate .svgs

(The icons for player and producer weren't final and ought to be vector graphics as well, whether built into the font or separate svg.)

Editing the font file has caused browser cache issues, which we've worked around by updating the font name each time, for some reason, rather than take the time to build that into the gruntfile where it belongs.




### Making a template

Template itself goes in /app/templates/episode or /app/templates/scene or /app/templates/item.
Copy one of the existing ones, change it as needed, give it a reasonable new name and save it.

CSS goes in /app/templates/(whichever).css
(When possible prefer CSS variations to HTML variations -- most of the episode template differences are pure CSS.)

Place any images in /app/images/customer/ (or somewhere nearby)


For now you'll need to test your template changes against both the new modeless UI used in producer 
and editor, and the three-mode UI used in the existing player episodes (at `/#/episode/(episodeID)` urls);
there are some CSS differences between the two that can affect the appearance of content items.
Don't forget to check all modes (including the search pane in the new UI).

The three-mode UI is to be phased out at a semester break, after which this complication will no longer be be necessary.


### Registering a template

Two pieces of code need to be run to make your new templates usable: the template needs to be 
registered in the database to get an ID number, and the template needs to be made selectable 
in editor or producer.

#### Add it to the Producer interface

For episodes, open /app/templates/producer/episode.html (episode templates aren't editable in editor yet). 
Look for the `<select>` input with ng-model="episode.templateUrl" and add your new template as an
`<option>`.


For scenes or items, add the `<option>` to the appropriate `<select>` in 
/app/templates/producer/item.html (there are several depending on which type of item your template
is designed for.)


Having done the above you'll be able to select and preview your template locally, which is 
convenient when designing, but you'll need to do the next step before you can save items using 
the new template:

#### Register it on the server

Templates need an ID on each server -- the same template will not have the same ID on each server,
so when adding a new template you'll need to do this once on every server (dev, demo, and production, 
and your local database if you're using one.)

There's currently no user interface for this; you'll need to run a bit of Angular code:

For episodes:
````
dataSvc.createTemplate({
	url: 'templates/episode/example.html',
	name: 'Example Template',
	applies_to_episode: true,
});
````
The "name" field is mostly optional, it was used in an older authoring interface. The url and 
'applies_to_episode' field are required. (There is also a not-yet-in-use 'applies_to_narrative' field available here.)

For scenes or content items, you should also specify the content type the template applies to:

````
dataSvc.createTemplate({
	url: 'templates/item/example.html',
	name: 'Example Template',
	event_types: ['Plugin'], // one of Upload, Scene, Plugin, Annotation, Link
});
````

The easiest way to do this currently is to wrap the above in a convenient temporary controller function --
I've been wedging it into $scope.tmp() in PlayerController.js -- and then add a quick temporary link to call
that function from whatever.

One at a time, edit your config.js to point to each of the servers you need to register the new template on:

````
apiDataBaseUrl: false // for a local database
apiDataBaseUrl: 'https://api-dev.inthetelling.com'
apiDataBaseUrl: 'https://demo.inthetelling.com'
apiDataBaseUrl: 'https://story.inthetelling.com'
````

ONCE per server, log in as an admin and then call that createTemplate function. I'm not sure if there's 
any protection on the server side against accidentally registering the same template twice. It would be a 
Bad Thing if it happened, though, I haven't tempted fate by trying it.

Once this is complete, disable your temp function, remove the temporary link that called it.  Deploy the client
codebase to each server, so the template and the ability to select it will be there, and you're done. 


### Design changes

The three-modes UI used in episodes is to be phased out and replaced with the modeless UI currently used in editor and producer. See TS-832


## DEVELOPER


### Active branches

"dev" branch for small fixes and pre-deploy testing.  "master" should match what is in production. Larger features should be built on branches from "dev".


### Work in progress


#### DataMgr
The branch "dataMgr" contains some incomplete but potentially useful work towards converting API access to use $resource. (When we first developed the product, $resource didn't support promises, so we rolled our own.)  It's unfortunately mingled with some deck-chair-rearranging of functionality between modelSvc and dataSvc and the new dataMgr service  (I think the idea was to obsolete modelSvc and replace it with dataMgr, for some reason?) which we probably don't need to keep.

#### Template / styles refactor
The branch "styles-refactor" contains a lot of incomplete work towards revamping the template system altogether, as well as some updates to the UI.

The goal of this refactor was to clean up the existing template structure, extricate us from some of the versioning headaches we've already had when supporting older episodes based on now-obsolete templates, and give the users a lot more options about how items should be displayed.  

##### UI widgets

The "/#/foo" route will show a testbed for some new UI widgets (better tabsets and floaters).  The directives for these are contained within ittStoryUI.js:
* ittStoryUi: overall layout for episode chrome (currently this is mostly stuffed willy-nilly inside the player.html template)
* ittTopToolbar and ittBottomToolbar: Guess what these are for.   ittBottomToolbar's template contains a stubbed-out version of the editPanel html.
* tabset and tab: configurable tabbed ui widget.  Tabs can be positioned on left or right (controlled by tabsLeft or tabsRight class)
* ittTopPane, ittPane, and ittPanePointer: for floating panels that should attach to content elements within the top toolbar (such as the 'user' pane). Can be docked to either side of the page or the center, and will try to keep its pointer arrow positioned near a specific DOM node (defined as scope.pointerTarget.)

CSS rules related to the above are in story.css.

##### Template refactor

The /#/event/annotation, /#/event/transcript, and /#/event/link show a working demo of the new template structure (in its partially implemented state).  This system has a LOT more individually selectable variations for each item (see in particular the 'style: new style' option in the pulldown under the style tab.)  Style combinations can currently be saved into localStorage; ultimately they were to be sharable via some API mechanism to be determined.

Previews of edits are handled by using a new "variantItem" parameter in ittItem, which will override the base item data for display within that directive (this is a much better and more flexible strategy than the old 'forceTemplate' thing, which only allowed overriding the item's templateUrl.  variantItem lets you override any combination of data fields for the item data without modifying the cached modelSvc version of the item (it would be a useful way of rendering item edits in progress, instead of copying them into appState.editEvent as we do currently.)

(Within template editingLayout and Position are only partially implemented. The templates themselves (in /templates/v2) are mostly just for testbed, not real designs.  

Items wind up rendered in templates/v2/wrapper/_global.html for boilerplate, then /v2/wrapper/{selected wrapper}.html, then the selected item template per item type (using templates/v2/(itemtype)/default.html by convention if none is specified.)

User-defined style collections are currently stored in localStorage as json blobs (you can view the raw data using `JSON.parse(localStorage.ittStylePresets)`.)  As with any individual template / stye selection, these blobs are overlaid atop item data using the variantItem parameter described above; when the user saves the edited item the various template/style selctions should be stored with the item itself (under the new item.tmpl field).

Most of the related code controlling this is in ittItemEditor.js.


#### Multi-episode timelines

This section outgrew markdown; see https://docs.google.com/document/d/1Q-VP_IRDX81fdGYvb67LxqJ0rsfANes3xfZ5LJCqWi4/