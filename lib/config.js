"use strict";

const path = require('path');
const fs = require('fs');

const Q = require('q');
const process = require('process');
const home = require('user-home');
const hue = require('node-hue-api');
const HueApi = hue.HueApi;
const inquirer = require('inquirer');

const config = path.join(home, '.hue-ambience.json');
const defaults = {
   fps: 5,
   framerate: 5,
   transition: 200,
   size: '1920x1080',
   resolution: '320x200'
};

function configure() {
   return Q.nfcall(fs.stat, config)
      .fail(initialize)
      .then(() => Q.nfcall(fs.readFile, config))
      .then(data => Object.assign(defaults, JSON.parse(data)));
}

function initialize() {
   return locateBridges()
      .then(selectBridge)
      .then(linkButtonPrompt)
      .then(register)
      .then(initializeDefaults);
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

      inquirer.prompt(questions, answers => deferred.resolve(answers.bridge.list));

      return deferred.promise;
   }

   return bridges[0].ipaddress;
}

function linkButtonPrompt(options) {
   console.log('Please press the link button on your bridge, then press any key...');

   process.stdin.setRawMode(true);
   process.stdin.resume();
   process.stdin.setEncoding('utf8');
   
   let deferred = Q.defer();
   
   process.stdin.on('data', function () {
      process.stdin.pause();
      deferred.resolve(options);
   });
   
   return deferred.promise;
}

function register(host) {
   return new HueApi()
      .registerUser(host, 'hue-ambience')
      .then(user => ({ user: user, host: host }));
}

function initializeDefaults(options) {
   options = Object.assign(options, defaults);   
   let json = JSON.stringify(options, null, 4);
   return Q.nfcall(fs.writeFile, config, json);
}

module.exports = configure;