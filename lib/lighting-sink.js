"use strict";

const Q = require('q');
const stream = require('stream');
const hue = require('node-hue-api');
const HueApi = hue.HueApi;
const lightState = hue.lightState;

class LightingSink extends stream.Writable {
   constructor(options) {
      super({ objectMode: true });
      
      this._api = new HueApi({
         host: options.host,
         username: options.username
      });
   }
   
   _write(chunk, encoding, callback) {
      Q.all(chunk.map(map =>
         this._api.setLightState(
            map.light,
            lightState.create()
               .on()
               .hue(map.hsl[0])
               .sat(map.hsl[1])
               .bri(map.hsl[2])
      ))).then(() => callback());
   }
}

module.exports = options => new LightingSink(options);