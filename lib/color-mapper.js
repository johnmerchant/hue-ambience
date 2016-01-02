"use strict";

const stream = require('stream');

class ColorMapper extends stream.Transform {
   
   constructor(map) {
      super({
         readableObjectMode: true,
         writableObjectMode: true
      });
      
      this._map = map;
   }
 
   _transform(bitmap, encoding, callback) {
      this.push(this._map.map(map => ({
         light: map.light,
         color: color(bitmap, map.x, map.y, map.w, map.h) 
      })));
      callback();
   }
}

function color(bitmap, x, y, w, h) {
   var r = 0;
   var g = 0;
   var b = 0;

   var ix;
   var iy;
   
   for (ix = 0; ix < w; ++ix) {
      for (iy = 0; iy < h; ++iy) {
         let i = (bitmap.width * (iy + y) + (ix + x)) << 2;
         let pixel = bitmap.data.readUInt32LE(i);
         r += pixel >> 16 & 0xff;
         g += pixel >> 8 & 0xff;
         b += pixel & 0xff;
      }
   }
   
   let area = w * h;
   
   r /= area;
   g /= area;
   b /= area;
   
   
   return r << 16 | g << 8 | b;
}


module.exports = options => new ColorMapper(options);