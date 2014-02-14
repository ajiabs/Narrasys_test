/* 
 Hacky way to work around the 3rd-party iframe cookie block in iOS and (apparently) chrome
 The site that frames us must include this script in their page head (and must be using jquery!)
 
 Will be obsolete when we switch to using header tokens instead of cookies 
*/


jQuery(document).ready(function() {
		jQuery('iframe').each(function() {
			var src = jQuery(this).attr("src");
			if (src.indexOf('inthetelling.com/')>-1 && src.indexOf('episode')>-1) {
				var delimiter = (src.indexOf('?') > -1) ? "&" : "?" ;
				src = src + delimiter + "return_to=" + document.location.href;
				jQuery(this).attr("src", src);
			}
		});
});
