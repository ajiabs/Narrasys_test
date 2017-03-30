/**
 * Created by githop on 3/28/17.
 */
'use strict';
const exec = require('child_process').exec;
const fs = require('fs');
const resolve = require('path').resolve;

const args = process.argv[2];

if (args) {
  readFontFile(args);
}

function pathTo(str) {
  //pass in file path to font from 'app' dir
  return resolve('../../', str);
}

function readFontFile(path) {
  const prefix = 'data:application/x-font-woff;charset=utf-8;base64,';
  let url = '';

  let opensslPrefix = 'openssl base64 < ';
  let cmd = opensslPrefix + pathTo(path) + " | tr -d '\n'";
  exec(cmd, function(err, stdout, stderr) {
    url = prefix + stdout;
    let css = `src: url(${url}) format('woff');`;
    console.log(css);
  });
}
