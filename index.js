"use strict";

const process = require('process');
const lossy = require('lossystream');
const Q = require('q');

const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');
const lighting = require('./lib/lighting-sink');

function run(options) {
   
   let screen = screencap();
   
   screen.stream
      .pipe(bitmap())
      .pipe(colormap(options.colormap))
      .pipe(lossy())
      .pipe(lighting({
         host: options.host,
         
      }));
   
   process.on('SIGINT', function () {
      screen.end();
      process.exit();
   });  
}

