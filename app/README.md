tellingplayer
=============

Telling Player 3.0

### The major code objects:

#### player: (player.js)
draws course nav, episode toolbar

#### video: (video.js)
wrapper around videojs.  

#### episode: (episode.js)
handles all event scheduling -- enter/exit of scenes, transmedia items
draws chrome and user controls

#### scene: (scene.js)
responsible for positioning and drawing transitions between scenes.

#### scene template: (currently sceneA, sceneB, sceneC within scene.js)
responsible for layout & positioning transmedia and transcript items.  Draws transmedia items as icons or blurbs, or tells transmedia templates to draw themselves as large, medium, or small size (depending on the space allotted to them by the scene.)  Handle "enter" and "exit" events for scenes.  Deals with (future) "required", "optional", "stop" flags on individual items

(the 'small/medium/large' thing is not yet implemented; right now the transmedia widget just draws itself the same regardless of context, but I want to allow for it to be able to appear differently depending on how much room it has to breathe)

#### item template: (transmedia.js)

responsible for layout and behavior of individual transmedia
items.  Currently just one widget; eventually should allow for multiple templates per logical type (link, image, etc)  Handle "enter" and "exit" events, at sm/med/lg sizes (as instructed by scene template)


### TODO / bugs
* scene transitions need to be triggerable by user scroll
* need to add more scene templates distinct from the locked "fullscreen" and "thumbnail" options (currently it looks like a bug if you lock to a template that's already being used)
* scene transitions need to be visible
* video doesn't autoplay on ipad/phone without an explicit user click; need to modify the 'splash screen' click to actually be on the poster frame
* videojs controls not working well on iphone/ipad; may need to stick with native controls there (though that loses the bottom-of-the-screen location)
* JSON format: identify necessary changes to existing 2.0 data structure, see if we can get those built in serverside
* video playhead needs to have markers for scene transition points
* scene titles need to be displayed somewhere (goes along with cross-episode nav)
* The current mechanism for determining which template renders the item or scene is really dumb. 
* should be able to scroll window to transition between scenes (if user has already scrolled to the bottom of a scene, watch for a further scroll-down event to trigger moving to the next scene)
* item and scene templates need to be position-independent (so their position can be animated during enter and exit without blowing up the rest of the layout)
* transmedia items disappear too soon in some scenes -- at minimum make them go away only if the next transcript block has no transmedia items.  Better still define explicit exit points for all items in the json
* group transmedia items of similar type, so there can be transmedia item templates that display more than one item. (e.g. an image carousel for four 'slide' tm items.) Can't decide if this should happen automatically when items at the same start time are detected, or if it should be explicit in the json.  Probably should be explicit in the json.
* look at the bookmarks feature in player 2.0, make sure we're covering the same functionality in 3.0 (i think we aren't yet)
* Stop media (interstitial quiz, etc) -- Probably should be treated as scenes, interstitial between "real" scenes. (this is a "not yet" feature)

* item event scheduling can go all screwy if lots of user events; I think the timeouts are sometimes not being cleared correctly [Possibly fixed]
