jQuery(document).ready(function() {
	if (navigator.platform.indexOf('iPhone') > -1 || navigator.platform.indexOf('iPod') > -1) {
		jQuery('iframe').each(function() {
			var src = jQuery(this).attr("src");
			if (src.indexOf('inthetelling.com/#/episode')>-1) {
				var delimiter = (src.indexOf('?') > -1) ? "&" : "?" ;
				src = src + delimiter + "return_to=" + document.location.href;
				jQuery(this).attr("src", src);
			}
		});
	}
});
