"use strict";

const fs = require('fs');
const path = require('path');

const Q = require('q');
const process = require('process');
const lossy = require('lossystream');
const inquirer = require('inquirer');
const home = require('user-home');
const hue = require('node-hue-api');
const HueApi = hue.HueApi;

const screencap = require('./lib/screen-capture');
const bitmap = require('./lib/bitmap-stream');
const colormap = require('./lib/color-mapper');
const lighting = require('./lib/lighting-sink');

const config = path.join(home, '.hue-ambience.json');
const defaults = {
   fps: 10,
   transition: 10,
   size: '1280x720',
   lightmap: {
      '1': [0, 0, 1280, 720]
   }
};

function run(options, api) {
   
   let screen = screencap({
      fps: options.fps,
      size: options.size
   });
   
   var drops = 0;
   
   let pipe = screen.stream
      .pipe(bitmap())
      .pipe(lossy().on('drop', () => ++drops))
      .pipe(colormap(options.lightmap))
      .pipe(lighting(api));
   
   var timeout;
   function logDrops(start) {
      timeout = setTimeout(function () {
         if (drops > 0) {
            console.log([
               drops,
               ' frames dropped (',
               ((new Date().valueOf() - start.valueOf()) / 1000.0).toFixed(2),
               '/sec)'
            ].join(''));
            drops = 0;
         }
         logDrops(new Date());
      }, 1000);
   }
   logDrops(new Date());
   
   let deferred = Q.defer();
   
   pipe.on('finish', () => deferred.resolve());
   pipe.on('error', err => deferred.reject(err));
   
   process.on('SIGTERM', () => screen.end());
   process.on('SIGINT', () => screen.end());
   process.on('SIGHUP', () => screen.end());
   
   return deferred.promise.fin(() => clearTimeout(timeout));
}

function main() { 
   return Q.nfcall(fs.stat, config)
      .fail(configure)
      .then(() => Q.nfcall(fs.readFile, config))
      .then(data => Object.assign(JSON.parse(data), defaults))
      .then(function (options) {
         let api = new HueApi(options.host, options.user);
         return api.config().then(config => run(options, api));
      })
      .done();
}

function configure() {
   return locateBridges()
      .then(selectBridge)
      .then(register)
      .then(configureDefaults);
}

function locateBridges() {
   return hue.nupnpSearch().then(function (bridges) {
      if (bridges.length === 0) {
         console.warn('No bridges found with nupnp');
         return hue.upnpSearch();
      }
      return bridges;
   });
}

function selectBridge(bridges) {
   
   if (bridges.length === 0) {
      throw new Error('No bridges found');
   }

   if (bridges.length > 1) {

      let questions = [{
         type: 'list',
         name: 'bridge',
         message: 'choose a bridge.',
         choices: bridges.map(bridge => bridge.ipaddress)
      }];

      let deferred = Q.defer();

      inquirer.prompt(questions, function (answers) {
         deferred.resolve(answers.bridge.list);
      });

      return deferred.promise;
   }

   return bridges[0].ipaddress;
}

function register(host) {
   console.log('Please press the link button on your bridge.');
   return new HueApi()
      .registerUser(host, 'hue-ambience')
      .then(user => ({ user: user, host: host }));
}

function configureDefaults(options) {
   options = Object.assign(options, defaults);   
   let json = JSON.stringify(options);
   return Q.nfcall(fs.writeFile, config, json);
}

if (require.main === module) {
   main();  
} else {
   module.exports = main;
}