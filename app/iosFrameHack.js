/* 
 Hacky way to work around the 3rd-party iframe cookie block in iOS and (apparently) chrome
 The site that frames us must include this script 
 
 Will be obsolete when we switch to using header tokens instead of cookies 
*/

(function(){
	var tId = setInterval(function(){if(document.readyState == "complete") onComplete()},11);
	function onComplete(){
		clearInterval(tId);
		
		var iframes = document.querySelectorAll('iframe');
		for (var i=0; i<iframes.length; i++) {
			var src = iframes[i].getAttribute('src');
			if ( src.indexOf('episode')>-1) {
				var delimiter = (src.indexOf('?') > -1) ? "&" : "?" ;
				src = src + delimiter + "return_to=" + document.location.href;
				iframes[i].setAttribute('src',src);
			}
		}
	};
})()