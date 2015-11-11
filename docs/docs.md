# In The Telling Story

## GETTING STARTED

### Build, locally run client code
(todo move from README)

### Build, locally run server instance
(todo link to api repo)

### Test locally or against specific servers

config.js

## DESIGNER

### Overview

### Making a template

Template itself goes in /app/templates/episode or /app/templates/scene or /app/templates/item.
Copy one of the existing ones, change it as needed, give it a reasonable new name and save it.

CSS goes in /app/templates/(whichever).css
(prefer CSS variations to HTML variations -- most of the episode template differences are pure CSS.)

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

For episodes, open /app/templates/producer/episode.html (episodes aren't editable in editor yet). 
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


### Available variables

#### Episode
#### Scene
#### Item


### Design changes

The three-modes UI used in episodes is to be phased out and replaced with the modeless UI used in 

## DEVELOPER

### Overview

#### Player

#### Editor / Producer

### Hacks to watch out for, and dead code you can probably prune

### Active branches

* pathslug
* video swapping
* matt's dataMgr
* nextgen templates



### Work in progress

...active branches, plus





#### Phase out the three-modes UI

need to add /search urls and ?t= param to narratives, decide what to do with old /watch, /search urls if anything

#### Template / styles refactor

#### Multi-episode timelines

