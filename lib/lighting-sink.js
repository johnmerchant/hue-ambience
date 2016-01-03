"use strict";

const Q = require('q');
const stream = require('stream');
const lightState = require('node-hue-api').lightState;

class LightingSink extends stream.Writable {
   constructor(api, options) {
      super({ objectMode: true });
      this._api = api;
      this._options = options;
   }
   
   _write(chunk, encoding, callback) {
      Q.all(chunk.map(map =>
         this._api.setLightState(
            map.light,
            lightState.create().on()
               .rgb(map.rgb)
               .transition(this._options.transition)
         ))).then(() => callback()).done();
   }
}

module.exports = options => new LightingSink(options);