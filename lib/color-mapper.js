"use strict";

const stream = require('stream');

class ColorMapper extends stream.Transform {
   
   constructor(options) {
      super({
         readableObjectMode: true,
         writableObjectMode: true
      });
   }
 
   _transform(chunk, encoding, callback) {
      
   }
}

module.exports = options => new ColorMapper(options);