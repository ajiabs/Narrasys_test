'use strict';

/* stripped-down version of videojs.markers plugin */

(function ($, undefined) {
   //default setting
   var default_setting = {
      markerTip: {
         display: true,
      }
   };

   /**
    * register the markers plugin (dependent on jquery)
    */
   videojs.plugin('markers', function (options) {
      var markers = [],
         setting = $.extend(true, {}, default_setting, options.setting),
         video_wrapper = $(this.el()),
         player = this;
      options.marker_text = options.marker_text || [];
      options.marker_breaks = options.marker_breaks || [];

      function createMarkers() {
         // create the markers
         var duration, m, pos, text;
         console.log("[videojs-markers] creating markers");
         duration = player.duration();
         $.each(options.marker_breaks, function (key, time) {
            pos = (time / duration) * 100;
            m = $("<div class='vjs-marker'  id='" + key + "'></div>");
            m.css({
               //             "margin-left": -parseFloat(m.css("width")) / 2 + 'px',
               "left": pos + '%'
            });

            video_wrapper.find('.vjs-progress-control').append(m);
            text = options.marker_text[key] || "";
            markers.push({
               div: m,
               time: time,
               pos: pos,
               text: text
            });
         });
      }

      function displayMarkerTip() {
         var marker_tip;
         console.log("[videojs-markers] creating marker tip");
         marker_tip = $("<div class='vjs-tip'><div class='vjs-tip-arrow'></div><div class='vjs-tip-inner'></div></div>");
         video_wrapper.find('.vjs-progress-control').append(marker_tip);

         video_wrapper.find('.vjs-marker').on('mouseover', function () {
            var id = this.id;
            marker_tip.find('.vjs-tip-inner').html(markers[id].text);

            //margin-left needs to minus the padding length to align right now the markers
            marker_tip.css({
               "left": markers[id].pos + '%',
               "margin-left": -parseFloat(marker_tip.css("width")) / 2 + 5 + 'px',
               "visibility": "visible"
            });

         }).on('mouseout', function () {
            marker_tip.css("visibility", "hidden");
         });
      }

      //load the markers
      this.on("loadedmetadata", function () {
         createMarkers();
         //bind click event to seek to marker time
         video_wrapper.find('.vjs-marker').on('click', function (e) {
            player.currentTime(markers[this.id].time);
         });
         if (setting.markerTip.display) {
            displayMarkerTip();
         }
      });
   });
})(jQuery);
