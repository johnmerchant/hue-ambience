"use strict";

const Promise = require('bluebird');
const process = require('process');
const hue = require('node-hue-api');
const HueApi = hue.HueApi;

const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');

let screen = screencap();

screen.stream.pipe(bitmap()).on('data', data => console.log(data));

process.on('SIGINT', function () {
   screen.end();
   process.exit();
});