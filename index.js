"use strict";

const fs = require('fs');
const path = require('path');

const Q = require('q');
const process = require('process');
const lossy = require('lossystream');
const hue = require('node-hue-api');
const HueApi = hue.HueApi;

const config = require('./lib/config');
const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');
const lighting = require('./lib/lighting-sink');

function run(options, api) {
   
   let screen = screencap({
      fps: options.fps,
      framerate: options.framerate,
      size: options.size,
      resolution: options.resolution
   });
   
   let pipe = screen.stream
      .pipe(bitmap())
      .pipe(colormap(options.lightmap))
      .pipe(lossy())
      .pipe(lighting(api, {
         transition: options.transition
      }));
      
   let deferred = Q.defer();
   
   pipe.on('finish', () => deferred.resolve());
   pipe.on('error', err => deferred.reject(err));
   
   process.on('SIGTERM', () => screen.end());
   process.on('SIGINT', () => screen.end());
   process.on('SIGHUP', () => screen.end());
   
   return deferred.promise;
}

function main() { 
   return config().then(function (options) {
      let api = new HueApi(options.host, options.user);
      return api.config().then(config => run(options, api));
   }).done();
}

if (require.main === module) {
   main();  
} else {
   module.exports = main;
}