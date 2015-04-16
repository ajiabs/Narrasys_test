angular.module('com.inthetelling.story')
	.service('StyleDataModel', function StyleDataModel() {
		this.data = [{
				"_id": "5240be41dd4736976c00000d",
				"created_at": "2013-11-01 22:33:37 UTC",
				"css_name": "highlightCurrent",
				"description": "highlights current items",
				"display_name": "Style One",
				"updated_at": "2013-11-01 22:33:37 UTC"
			}, {
				"_id": "5240be41dd4736976c00000e",
				"created_at": "2013-11-01 22:33:43 UTC",
				"css_name": "transitionFoo",
				"description": "styling for a transition",
				"display_name": "Style Two",
				"updated_at": "2013-11-01 22:33:43 UTC"
			},
			{
				"_id": "528d17f0ba4f65e578000031",
				"display_name": "Top left",
				"css_name": "tl",
				"description": "Positions the image at the top left corner of the parent pane or video",
				"updated_at": "2013-11-20T20:13:36Z",
				"created_at": "2013-11-20T20:13:36Z"
			}, {
				"_id": "528d17f0ba4f65e578000032",
				"display_name": "Top right",
				"css_name": "tr",
				"description": "Positions the image at the top right corner of the parent pane or video",
				"updated_at": "2013-11-20T20:13:36Z",
				"created_at": "2013-11-20T20:13:36Z"
			}, {
				"_id": "528d17f0ba4f65e578000033",
				"display_name": "Bottom left",
				"css_name": "bl",
				"description": "Positions the image at the bottom left corner of the parent pane or video",
				"updated_at": "2013-11-20T20:13:36Z",
				"created_at": "2013-11-20T20:13:36Z"
			}, {
				"_id": "528d17f0ba4f65e578000034",
				"display_name": "Bottom right",
				"css_name": "br",
				"description": "Positions the image at the bottom right corner of the parent pane or video",
				"updated_at": "2013-11-20T20:13:36Z",
				"created_at": "2013-11-20T20:13:36Z"
			}, {
				"_id": "528d17f1ba4f65e578000035",
				"display_name": "Fill",
				"css_name": "fill",
				"description": "Positions the image to fill the entirety of the parent pane or video",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e578000036",
				"display_name": "Typography Serif",
				"css_name": "typographySerif",
				"description": "Controls the fonts and relative text sizes",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e578000037",
				"display_name": "Typography Sans",
				"css_name": "typographySans",
				"description": "Controls the fonts and relative text sizes",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e578000038",
				"display_name": "Typography Book",
				"css_name": "typographyBook",
				"description": "Controls the fonts and relative text sizes",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e578000039",
				"display_name": "Typography Swiss",
				"css_name": "typographySwiss",
				"description": "Controls the fonts and relative text sizes",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e57800003a",
				"display_name": "Color invert",
				"css_name": "colorInvert",
				"description": "Controls the text color -- use colorInvert for an item that will be on a dark background, for example, so it will have white type",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e57800003b",
				"display_name": "Color sepia",
				"css_name": "colorSepia",
				"description": "Controls the text color",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e57800003c",
				"display_name": "Color solarized",
				"css_name": "colorSolarized",
				"description": "Controls the text color",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f1ba4f65e57800003d",
				"display_name": "Color vivid",
				"css_name": "colorVivid",
				"description": "Controls the text color",
				"updated_at": "2013-11-20T20:13:37Z",
				"created_at": "2013-11-20T20:13:37Z"
			}, {
				"_id": "528d17f2ba4f65e57800003e",
				"display_name": "Highlight solid",
				"css_name": "highlightSolid",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e57800003f",
				"display_name": "Highlight border",
				"css_name": "highlightBorder",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000040",
				"display_name": "Highlight side",
				"css_name": "highlightSide",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000041",
				"display_name": "Highlight highlighter",
				"css_name": "highlightHighlighter",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000042",
				"display_name": "Highlight tilt",
				"css_name": "highlightTilt",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000043",
				"display_name": "Highlight bloom",
				"css_name": "highlightBloom",
				"description": "Controls the appearance of items that are current in the timeline",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000044",
				"display_name": "Timestamp default",
				"css_name": "timestampDefault",
				"description": "Controls the appearance of the item timestamp",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000045",
				"display_name": "Timestamp none",
				"css_name": "timestampNone",
				"description": "Controls the appearance of the item timestamp",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f2ba4f65e578000046",
				"display_name": "Timestamp small",
				"css_name": "timestampSmall",
				"description": "Controls the appearance of the item timestamp",
				"updated_at": "2013-11-20T20:13:38Z",
				"created_at": "2013-11-20T20:13:38Z"
			}, {
				"_id": "528d17f3ba4f65e578000047",
				"display_name": "Timestamp inline",
				"css_name": "timestampInline",
				"description": "Controls the appearance of the item timestamp",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "528d17f3ba4f65e578000048",
				"display_name": "Timestamp sidebar",
				"css_name": "timestampSidebar",
				"description": "Controls the appearance of the item timestamp",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "528d17f3ba4f65e578000049",
				"display_name": "Transition fade",
				"css_name": "transitionFade",
				"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "528d17f3ba4f65e57800004a",
				"display_name": "Transition slide left",
				"css_name": "transitionSlideL",
				"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "528d17f3ba4f65e57800004b",
				"display_name": "Transition slide right",
				"css_name": "transitionSlideR",
				"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "528d17f3ba4f65e57800004c",
				"display_name": "Transition pop",
				"css_name": "transitionPop",
				"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
				"updated_at": "2013-11-20T20:13:39Z",
				"created_at": "2013-11-20T20:13:39Z"
			}, {
				"_id": "5321c5a5ba4f6586fb000015",
				"display_name": "Center",
				"css_name": "center",
				"description": "Center the item",
				"updated_at": "2014-03-13T14:50:13Z",
				"created_at": "2014-03-13T14:50:13Z"
			}, {
				"_id": "5321c5ebba4f6586fb000016",
				"display_name": "Contain",
				"css_name": "contain",
				"description": "Fits the item within the layout area without stretching it, but may leave extra space. ",
				"updated_at": "2014-03-13T14:51:23Z",
				"created_at": "2014-03-13T14:51:23Z"
			}, {
				"_id": "5321c60bba4f6586fb000017",
				"display_name": "Cover",
				"css_name": "cover",
				"description": "Enlarges the image to fill the entire space, but may cut off part of the image.",
				"updated_at": "2014-03-13T14:51:55Z",
				"created_at": "2014-03-13T14:51:55Z"
			}, {
				"_id": "5321c640ba4f6586fb000018",
				"display_name": "Typography e-Literate.tv",
				"css_name": "typographyEliterate",
				"description": "Font for e-Literate.tv",
				"updated_at": "2014-03-13T14:52:48Z",
				"created_at": "2014-03-13T14:52:48Z"
			}, {
				"_id": "5321c66eba4f6586fb000019",
				"display_name": "Color for e-Literate.tv",
				"css_name": "colorEliterate",
				"description": "Color scheme for e-Literate.tv",
				"updated_at": "2014-03-13T14:53:34Z",
				"created_at": "2014-03-13T14:53:34Z"
			}
		];
	});
