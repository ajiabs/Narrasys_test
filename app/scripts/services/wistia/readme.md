# Wistia playerManager docs


[construct a wistia embed](https://wistia.com/doc/construct-an-embed-code)


## potential input formats

- wistia URL to video; e.g. https://narrasys.wistia.com/medias/cbqa9uzl0y

wista embed code; e.g.
 
 
     <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>
     <div class="wistia_embed wistia_async_26sk4lmiix" style="height:360px;width:640px">&nbsp;</div>


It looks like the fist script downloads their player code, and attaches a '_wq' array to
the window object where configurations are pushed.

we can generate the second script ourselves, where the id of the wistia video is the string
in 'wistia_async_<wistia id>'
