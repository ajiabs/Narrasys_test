/**
 * Created by githop on 7/26/16.
 */

const bgImage = (img) => {
    if (img != null && img !== 'none') {
        return `background-image: url('/images/customer/${img}');`;
    }
    return '';
};

const fontFam = (font) => {
    const fonts = font.split(',');
    const main = fonts[0];
    const fallback = fonts[1];
    const weight = fonts[2];
    if (fallback != null && weight != null) {
        return `\tfont-family: '${main}', ${fallback};\n\t\tfont-weight: ${weight}`;
    } else if (fallback != null) {
        return `\tfont-family: '${main}', ${fallback}`;
    }
    return `\tfont-family: '${main}'`;
};

const pqFont = (font: string) => {
    return font.split(',')[0];
};

export const genCss = ({nameSpace, accentColor, primaryColor, secondaryColor, linkColor, highlightColor, headerFont, bodyFont, accentFont, bgMain, bgAlt, bgMondrian, bgWindow}) => {
    return `
    $${nameSpace}Primary: #${primaryColor};
    $${nameSpace}Accent: #${accentColor};
    $${nameSpace}Secondary: #${secondaryColor};
    $${nameSpace}Link: #${linkColor};
    $${nameSpace}Highlight: rgba(${highlightColor});

    @mixin ${nameSpace}-header {
    ${fontFam(headerFont)};
    }
    @mixin ${nameSpace}-body {
    ${fontFam(bodyFont)};
	    color: $${nameSpace}Primary;
    }

    @mixin ${nameSpace}-pq {
    ${fontFam(accentFont)};
	    color: $${nameSpace}Primary;
    }

    .${nameSpace} {
        
        ${bgImage(bgWindow)}
        
        .landingscreen {
            h1 {
                @include banner-pq('${pqFont(headerFont)}', $${nameSpace}Accent, 2.5vw);
            }
        }

        .endingscreen {
            p {
                @include banner-pq('${pqFont(headerFont)}', $${nameSpace}Accent, 2.5vw);
            }
        }

        //search view
        .searchPanel__wrapper {
            @include ${nameSpace}-body;
            color: $${nameSpace}Primary;
            // 'sorted by' button
            .fake-link--search-results {
                color: $${nameSpace}Link;
            }
        }
        
        .searchResults {
            @include ${nameSpace}-header;
            .item__title--link, .item__link--fake-link, .item__link--escape-link {
                @include ${nameSpace}-body;
                color: $${nameSpace}Link;
                &:before {
                    color: $${nameSpace}Primary;
                }
            }
        }

        //item overrides
        .item__title {
            @include ${nameSpace}-header;
        }

        .item__title--link, .item__title--file {
            a {
                color: $${nameSpace}Link;
            }
        }

        .item__link--fake-link {
            @include ${nameSpace}-body;
            color: $${nameSpace}Link;
        }

        .item__text {
            @include ${nameSpace}-body;
        }

        .item__text--h2 {
            @include ${nameSpace}-header;
        }

        .item__text--transmedia, .item__text--definition {
            h1, h2, h3 {
                @include ${nameSpace}-header;
            }
        }
        .item .item__text--pullquote {
            @include ${nameSpace}-pq;
            &:before {
                @include ${nameSpace}-header;
                //override color set on mixin
                color: $${nameSpace}Accent;

            }
        }

       .item__title--image-caption, .item__title--image-caption-sliding,
	   .item__text--image-caption, .item__text--image-caption-sliding {
	        color: $${nameSpace}Secondary;
	   }
        
        .item__link--escape-link {
            @include ${nameSpace}-body;
            color: $${nameSpace}Link;
            &:before {
                color: $${nameSpace}Primary;
            }
        }
        
        //timestamp
        .item {
            .displayTime, .startTime {
                @include ${nameSpace}-header;
                color: $${nameSpace}Link;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
        
       //invert 
        .item {
            &.colorInvert {
                background-color: $${nameSpace}Primary !important;
             .item__text {
                 color: $${nameSpace}Secondary !important;
             }
            }
        }
        
        //highlights
        .content.allowHighlights {
        	.highlightSolid.item.isCurrent {
        		background-color: $${nameSpace}Highlight;
        	}
        	
        	.highlightSide.item.isCurrent {
        		border-left: 10px solid $${nameSpace}Highlight;
        	}
        	
        	.highlightBorder.item.isCurrent {
        		border: 2px solid $${nameSpace}Highlight;
        	}
        }
        
        //layout specific overrides
        .centered-pro {
            .banner-pull-quote {
                h1 {
                    @include banner-pq('${pqFont(headerFont)}', $${nameSpace}Accent, 2.5vw);
                }
            }
        }

		//pro two col: centerVV
		//non-pro two col: pip, cornerH, cornerV, twocol
		//non-pro one col: centered, onecol
        .centerVV, .cornerV, .twocol, .centered, .cornerH, .pip, .onecol {	
            .static-bg__main {
                ${bgImage(bgMain)}
            }
            
            .static-bg__alt {
                ${bgImage(bgAlt)}
            }
            
            .item__title--link, .item__title--file {
                @include ${nameSpace}-body;
            }

            .item__title--link.title--link-embed {
                @include ${nameSpace}-body;
            }

        }

        .centerVV-mondrian {           
            .static-bg__main {
                border: 4px solid $${nameSpace}Primary;
                background-color: $${nameSpace}Accent;
            }
            
            .static-bg__alt {
                ${bgImage(bgMondrian)}
            }

      		.mainPane {
			    .item {
				    background-color:  $${nameSpace}Primary;
			    }

			.item__text, .item__title, .item__title a {
				color: $${nameSpace}Secondary;
			}
			
			//override from general item level,
			//mondrian BG is solid color, so we need to use
			//the Secondary
			.item__text--transmedia, .item__text--definition {
				h1, h2, h3 {
					color: $${nameSpace}Secondary;
				}
			}
			
			.item {
			    &.colorInvert {
			        background-color: $${nameSpace}Secondary !important;
                    .item__text, .item__title, .item__title a {
                        color: $${nameSpace}Primary !important;
                    }
                }
            }
			
		}

        
		//item__<entity> for non URL titles
		// item__<entity> a covers both escape and fakeLinks
		.item__title--link,
		.item__title--image,
		.item__title--image-thumbnail,
		.item__title--link a,
		.item__title--image a,
		.item__title--image-thumbnail a {
			@include ${nameSpace}-header;
		}
		
		.item__link--fake-link {
			color: $${nameSpace}Secondary;
		}

		.item__link--escape-link {
			@include ${nameSpace}-header;
			color: $${nameSpace}Secondary;
			&:before {
				color: $${nameSpace}Accent;
			}
		}
		
		.item {
		    .displayTime, .startTime {
		        @include ${nameSpace}-header;
		        color: $${nameSpace}Secondary;
		        
		        a {
		            text-decoration: underline;
		        }
		    }
		}
    }
}`
};

