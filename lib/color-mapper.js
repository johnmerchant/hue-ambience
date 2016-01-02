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
         hsb: averageHsb(bitmap, map.x, map.y, map.w, map.h) 
      })));
      callback();
   }
}

function averageHsb(bitmap, x, y, w, h) {
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
   
   return rgbToHsb(r, g, b);
}

function rgbToHsb(r, g, b) {
   r /= 255;
   g /= 255;
   b / 255;
   
   let max = Math.max(r, g, b);
   let min = Math.min(r, g, b);
   
   var h;
   var s;
   let bri = (max + min) / 2;

   if (max === min) {
      h = s = 0;
   } else {
      let d = max - min;
      s = bri > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
         case g:
            h = (b - r) / d + 2;
            break;
         case b:
            h = (r - g) / d + 4;
            break;
      }
      h /= 6;
   }
   
   return [h, s, l];
}

module.exports = options => new ColorMapper(options);