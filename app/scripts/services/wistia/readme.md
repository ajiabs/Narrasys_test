# Wistia playerManager docs


[construct a wistia embed](https://wistia.com/doc/construct-an-embed-code)


## potential input formats

- wistia URL to video; e.g. https://narrasys.wistia.com/medias/cbqa9uzl0y
- https://support.wistia.com/medias/26sk4lmiix


wista embed code; e.g.
 
 
     <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>
     <div class="wistia_embed wistia_async_26sk4lmiix" style="height:360px;width:640px">&nbsp;</div>


It looks like the fist script downloads their player code, and attaches a '_wq' array to
the window object where configurations are pushed.

we can generate the second script ourselves, where the id of the wistia video is the string
in 'wistia_async_<wistia id>'

### notes

Bare minimum amount of punlic methods in each sevice needed to load 
a player-manager using the episode tab:

scriptLoader
- load

urlService
- parseMediaSrc
- parseInput
- canPlay
- getOutGoingUrl*
- getMimeType 

playerManager
- seedPlayerManager
- create
- getPlayearState*
- getBufferedpercent*
- registerStateChangeListener*
- unregisterStateChangeListner*
- getMetaProp
- setMetaProp
- getPlayerDiv
 
note: * means a noop will do. 
 
 

it looks like using display:none with wistia causes the player not to initialize as
it's not in the render tree. use visibility: hidden instead.
 
 ### Initializing a wistia player
 
Unlike youtube or kaltura, wistia uses async script tags, per their docs:
 >Because E-v1.js is loaded asynchronously, we need to make sure any code that references it only runs after 
 <code>window.Wistia</code> is defined. There are a few ways to do that.
 
The pattern we use for handling downloading necessary third party scripts (E-v1.js in this case)
 is to load the script as lazily as possible, e.g. the first time a player is 
  loaded, we inject the relevant script tag to the document.
  
  For Wistia, we avoid injecting E-v1.js on subsequent player events by checking
  for the <code>Wistia</code> object on <code>window</code>. 

We ended up using the <code>wistiaInitQue</code> they advised:
```
window.wistiaInitQueue = window.wistiaInitQueue || [];
window.wistiaInitQueue.push(function(W) {
  console.log("Wistia library loaded and available in the W argument!");
});
```
We push a config object rather than a function into the initQueue as it makes
it easier to wire up a callback when the player is ready:
```
//wistiaPlayerManager.ts ...
window.wistiaInitQueue.push({
  id: pid,
  options: wistiaEmbedOptions,
  onReady: (video) => this.onReady(pid, video)
});
```

where <code>video</code> is the wistia instance (W in the first example).

