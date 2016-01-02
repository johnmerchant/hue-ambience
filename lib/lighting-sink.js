"use strict";

const stream = require('stream');
const hue = require('node-hue-api');

class LightingSink extends stream.Writable {
   constructor(options) {
      super({ objectMode: true });
   }
   
   _write(chunk, encoding, callback) {
      chunk.forEach(map => console.log(map.color.toString(16)));
      callback();
   }
}

module.exports = options => new LightingSink(options);