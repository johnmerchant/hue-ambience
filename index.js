"use strict";

const Promise = require('bluebird');
const process = require('process');

const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');
const lighting = require('./lib/lighting-sink');

let screen = screencap();

hue.nupnpSearch().then(function (bridges) {
   
});

screen.stream.pipe(bitmap())
   .pipe(colormap())
   .pipe(lighting());

process.on('SIGINT', function () {
   screen.end();
   process.exit();
});