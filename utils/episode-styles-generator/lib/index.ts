const fs = require('fs');
const {resolve} = require('path');
import {genCss} from './cssGen';
import {genHtml} from './htmlGen';

const pathToClientStyles = resolve('../../app/styles/');
const pathToEpisodeScss = resolve('../../app/styles/episode.scss');

const argv = require('yargs')
  .option('nameSpace', {
    alias: 'n',
    describe: 'the template namespace',
  })
  .option('headerFont', {
    alias: 'h',
    describe: 'the font for headers'
  })
  .option('accentFont', {
    alias: 'q',
    describe: 'the font for headers'
  })
  .option('bodyFont', {
    alias: 'b',
    describe: 'the font for text'
  })
  .option('primaryColor', {
    alias: 'p',
    describe: 'the primary color',
    type: 'string'
  })
  .option('secondaryColor', {
    alias: 's',
    describe: 'the secondary color',
    type: 'string'
  })
  .option('accentColor', {
    alias: 'a',
    describe: 'the accent color',
    type: 'string'
  })
  .option('linkColor', {
    alias: 'm',
    describe: 'A color that applies to links and timestamps',
    type: 'string'
  })
  .option('highlightColor', {
    alias: 'x',
    describe: 'The color to use for highlights',
    type: 'string'
  })
  .option('brandLogo', {
    alias: 'l',
    describe: 'the brand logo'
  })
  .option('bgMain', {
    alias: 'v',
    describe: 'the main col static background image'
  })
  .option('bgAlt', {
    alias: 't',
    describe: 'the alt col static background image'
  })
  .option('bgMondrian', {
    alias: 'z',
    describe: 'the mondrian alt col static background image'
  })
  .option('bgWindow', {
    alias: 'w',
    describe: 'The episode background image'
  })
  .argv;

const errhandler = (err) => {
  if (err) console.error(err);
};
const {
  nameSpace,
  accentColor,
  primaryColor,
  secondaryColor,
  linkColor,
  highlightColor,
  headerFont,
  bodyFont,
  accentFont,
  bgMain,
  bgAlt,
  bgMondrian,
  bgWindow,
  brandLogo
} = argv;

const cssTemplate = genCss(argv);
const htmlTemplate = genHtml(nameSpace, brandLogo);

interface ITemplateData {
  path: string;
  data: string;
}

const data: ITemplateData[] = [{
  path: `${pathToClientStyles}/_${nameSpace}.scss`,
  data: cssTemplate
}, {path: `out/${nameSpace}.html`, data: htmlTemplate}];

const appendImport = () => {
  fs.readFile(pathToEpisodeScss, 'utf8', (err, episodeScss) => {
    if (err) throw err;
    const match = `@import '${nameSpace}'`;
    const re = new RegExp(match, 'g');

    if (!re.test(episodeScss)) {
      episodeScss += `\n${match};`;
      fs.writeFile(pathToEpisodeScss, episodeScss, errhandler);
    } else {
      console.log('not appending', nameSpace);
    }
  });
};

data.forEach((blob: ITemplateData) => {
  fs.writeFile(blob.path, blob.data, errhandler);
});

appendImport();
