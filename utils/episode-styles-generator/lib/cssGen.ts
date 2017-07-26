/**
 * Created by githop on 7/26/16.
 */
/* tslint:disable: no-trailing-whitespace */
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
        return `
  font-family: '${main}', ${fallback};
  font-weight: ${weight}`.trim();
    } else if (fallback != null) {
        return `\tfont-family: '${main}', ${fallback}`;
    }
    return `\tfont-family: '${main}'`;
};

const pqFont = (font: string, nameSpace: string) => {
  const [fontName, fallback, weight, style] = font.split(',');
  const color = `\n  color: $${nameSpace}Primary;`;

  if (existy(style) && existy(weight)) {
    return `font-family: '${fontName}', ${fallback};\n  font-weight: ${weight};\n  font-style: ${style};` + color;
  }

  if (existy(weight)) {
    return `font-family: '${fontName}', ${fallback};\n  font-weight: ${weight};` + color;
  }

  return `font-family: '${fontName}', ${fallback};` + color;
};

//handle differences from the .professional namespace. currently only for 'unbranded' template
//which is used to replace our 'unbranded' template option.
const isUnbranded = (nameSpace) => {

	const css = `
//TS-1109
.professional__branding {
  width: 100%;
  height: 210px;
  background: linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.25));
  position: relative;
  color: #FFF;
  padding: 10px;
  .professional__copyright {
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
    color: white;
    a {
      color:white;
      text-decoration: underline;
    }
	}
}
//TS-1102	
.altPane {
  background-color: rgba(0, 0, 0, 0.05);
}`;

	if (nameSpace === 'unbranded') {
	  return css;
	}
  return '';
};

const handleHighlight = (highlightColor, nameSpace) => {
	if (highlightColor === 'none' || highlightColor === '' || !existy(highlightColor)) {
		//if no highlight color provided, set alpha to completely transparent
		return `$${nameSpace}Highlight: rgba(0, 0, 0, 0);`;
	}
	//hard code alpha to 0.6
	return `$${nameSpace}Highlight: rgba(${highlightColor}, 0.6);`;
};

const handleLandingScreen = (nameSpace, headerFont) => {
	const professionalCss = `
 .landingscreen {
   h1 {
     @include banner-pq('${headerFont.split(',')[0]}', $${nameSpace}Accent, 2.5vw);
   }
  
   .introtext {
     padding-bottom: 2em;
   }
  
   #episode--description {
     display: none;
	 }
 }`;
	//implement non-pro landing screen in professional namespace for unbranded template
	const css = `
.landingscreen {
  div {
    display: block;
  }
  p {
    margin: 2em 0 1em 0;
  }
  padding: 10% 15%;
  
  .introtext {
    width: 45%;
    float: right;
  }
  
  .videoMagnet {
    width: 50%;
    float: left;
    }
  }
  
  @media screen and (max-width: 501px) {
    .landingscreen {
      div {
        display: block;
      }
      h1 {
        font-size: 24px;
      }
      p {
        margin: 1em 0;
      }
      .introtext {
        width: 100%;
        float: none;
        margin: 0;
      }
      .videoMagnet {
        width: 100%;
        float: none;
      }
		}
	}`;

	if (nameSpace !== 'unbranded') {
		return professionalCss;
	}
	return css;
};

export const genCss = ({nameSpace, accentColor, primaryColor, secondaryColor, linkColor, highlightColor, headerFont, bodyFont, accentFont, bgMain, bgAlt, bgMondrian, bgWindow}) => {
  const CSS_TEMPLATE = `
$${nameSpace}Primary: #${primaryColor};
$${nameSpace}Accent: #${accentColor};
$${nameSpace}Secondary: #${secondaryColor};
$${nameSpace}Link: #${linkColor};
${handleHighlight(highlightColor, nameSpace)}
@import "helpers";

@mixin ${nameSpace}-header {
  ${fontFam(headerFont)};
  color: $${nameSpace}Primary;
}

@mixin ${nameSpace}-body {
  ${fontFam(bodyFont)};
  color: $${nameSpace}Primary;
}
@mixin ${nameSpace}-pq {
  ${pqFont(accentFont, nameSpace)}
}

.${nameSpace} {
  ${bgImage(bgWindow)}
           
  ${handleLandingScreen(nameSpace, headerFont)}
      
  //custom altPane BG, landingscreen
  ${isUnbranded(nameSpace)}
  
  .endingscreen {
    p {
      @include banner-pq('${headerFont.split(',')[0]}', $${nameSpace}Accent, 2.5vw);
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
      
      h1, h2, h3 {
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
    //hard code alpha to be 0.3 or half of default
    //aka translucent
    .highlightBloom.item.isCurrent {
      background-color: rgba(${highlightColor}, 0.3);
      box-shadow: 0 0 8px rgba(${highlightColor}, 0.3);
    }
  }
  
  //layout specific overrides
  .centered-pro {
    .banner-pull-quote {
      h1 {
        @include banner-pq('${headerFont.split(',')[0]}', $${nameSpace}Accent, 2.5vw);
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
    .altPane {
      background-color: transparent;
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
            &:before {
              color: $${nameSpace}Primary !important;
            }
          }
          
          h1, h2, h3 {
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
}`;
  return CSS_TEMPLATE;
};

