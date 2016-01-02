"use strict";

const process = require('process');
const lossy = require('lossystream');

const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');
const lighting = require('./lib/lighting-sink');

let screen = screencap();

screen.stream
   .pipe(bitmap())
   .pipe(colormap([{
      light: 1,
      x: 0,
      y: 0,
      w: 200,
      h: 200
   }]))
   .pipe(lossy())
   .pipe(lighting());

process.on('SIGINT', function () {
   screen.end();
   process.exit();
});