const stream = require('stream');
const hue = require('node-hue');

class LightingSink extends stream.Writable {
   constructor(options) {
      super({ objectMode: true });
      
      this._bridge = options.bridge;
   }
}

module.exports = options => new LightingSink(options);