/**
 * Created by githop on 7/26/16.
 */

const bgImage = (img) => {
    if (img != null && img !== 'none') {
        return `background-image: url('/images/customer/${img}');`;
    }
    return '';
};

const existy = (x) => x != null;

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

//handle differences from the .professional namespace. currently only for 'default' template
//which is used to replace our 'unbranded' template option.
const isDefault = (nameSpace) => {

	const css =
		`.professional__branding {
			width: 100%;
			height: 210px;
			background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.25));
			position: relative;
			color: #FFF;
		}
			
		.altPane {
			background-color: rgba(0, 0, 0, 0.05);
		}`;

	if (nameSpace === 'default') {
		return css;
	}
	return '';
};

const handleHighlight = (highlightColor, nameSpace) => {
	if (highlightColor === 'none' || highlightColor === '' || !existy(highlightColor)) {
		//if no highlight color provided, set alpha to completely transparent
		return `$${nameSpace}Highlight: rgba(0, 0, 0, 0);`;
	}
	return `$${nameSpace}Highlight: rgba(${highlightColor});`;
};

const handleLandingScreen = (nameSpace, headerFont) => {
	const professionalCss =
		`.landingscreen {
			h1 {
				@include banner-pq('${pqFont(headerFont)}', $${nameSpace}Accent, 2.5vw);
			}
		}`;
	const css =
		`.landingscreen {
			padding: 10% 15%;
			div {
				flex-direction: row-reverse;
			}
		}`;
	if (nameSpace !== 'default') {
		return professionalCss
	}
	return css
};

export const genCss = ({nameSpace, accentColor, primaryColor, secondaryColor, linkColor, highlightColor, headerFont, bodyFont, accentFont, bgMain, bgAlt, bgMondrian, bgWindow}) => {
    return `
    $${nameSpace}Primary: #${primaryColor};
    $${nameSpace}Accent: #${accentColor};
    $${nameSpace}Secondary: #${secondaryColor};
    $${nameSpace}Link: #${linkColor};
    ${handleHighlight(highlightColor, nameSpace)}

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
             
        ${handleLandingScreen(nameSpace, headerFont)}
        
		//custom altPane BG, landingscreen
		${isDefault(nameSpace)}

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
             	.item__text, .item__title a, .item__link--escape-link, a.displayTime.startTime {
                 	color: $${nameSpace}Secondary !important;
                 	&:before {
                 		color: $${nameSpace}Secondary !important;
                 	}
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

