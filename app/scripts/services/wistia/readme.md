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

