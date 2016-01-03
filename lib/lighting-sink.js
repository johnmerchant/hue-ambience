"use strict";

const Q = require('q');
const stream = require('stream');
const lightState = require('node-hue-api').lightState;

class LightingSink extends stream.Writable {
   
   constructor(api, options) {
      super({ objectMode: true });
      this._api = api;
      this._options = options;
      this._state = {};
   }
   
   _write(lights, encoding, callback) {
      let promises = lights
         .filter(lighting => this._filterState(lighting))
         .map(lighting => this._setLightState(lighting));
         
      Q.all(promises)
         .fin(err => callback())
         .done();
   }
   
   _filterState(lighting) {
      if (lighting.light in this._state) {
         let state = this._state[lighting.light];
         if (state.every((value, i) => value === lighting.rgb[i])) {
            return false;
         }
      }
      return true;
   }
   
   _setLightState(lighting) {

      this._state[lighting.light] = lighting.rgb
      
      return this._api.setLightState(
         lighting.light,
         lightState.create()
            .rgb(lighting.rgb)
            .transition(this._options.transition))
         .catch(() => delete this._state[lighting.light]);
   }
}

module.exports = (api, options) => new LightingSink(api, options);