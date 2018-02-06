'use strict';
require('events').EventEmitter.prototype._maxListeners = 10000;
const express = require('express'),
  request = require('request'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  fs = require('fs'),
  baseUrl = 'https://np-dev.narrasys.com',
  dir = path.resolve(__dirname, '../../tmp'),
  server = express();

const key = fs.readFileSync('./certs/private-2017.key');
const cert = fs.readFileSync('./certs/ssl-bundle-2017.crt');

const sslOpts = {
  key: key,
  cert: cert
};

let paths = [
  '/x_frame_options_proxy',
  '/v3/*',
  '/v2/*',
  '/v1/*',
  '/users/*',
  '/auth/*',
  '/login',
  '/logout',
  '/signup',
  '/show_user',
  '/pages',
  '/oauth2'
];

server.all(paths, doProxy);

http.createServer(server).listen(80);
https.createServer(sslOpts, server)
  .listen(443)
  .on('error', logErrors);

server.use(express.static(dir));

function doProxy(req, res) {
  var url = baseUrl + req.url;
  req
    .pipe(request(url))
    .on('error', logErrors)
    .pipe(res);
}

function logErrors(e) {
  console.log(e);
}
