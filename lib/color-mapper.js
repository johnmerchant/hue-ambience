"use strict";

const stream = require('stream');

class ColorMapper extends stream.Transform {
   
   constructor(map) {
      super({
         readableObjectMode: true,
         writableObjectMode: true
      });
      
      this._map = Object.keys(map).map(light => ({ 
         light: light,
         rect: map[light]
      }));
   }
 
   _transform(bitmap, encoding, callback) {
      
      this.push(this._map.map(map => ({
         light: map.light,
         rgb: averageRgb(bitmap, map.rect[0], map.rect[1], map.rect[2], map.rect[3]) 
      })));
      
      callback();
   }
}

function averageRgb(bitmap, x, y, w, h) {
   var r = 0;
   var g = 0;
   var b = 0;

   var ix;
   var iy;
   var area = 0;
   
   for (ix = 0; ix < w; ++ix) {
      for (iy = 0; iy < h; ++iy) {
         let i = (bitmap.width * (iy + y) + (ix + x)) << 2;
         if (i < bitmap.data.length) {
            let pixel = bitmap.data.readUInt32LE(i);
            r += pixel >> 16 & 0xff;
            g += pixel >> 8 & 0xff;
            b += pixel & 0xff;  
            area++;
         } else {
            console.warn(['out of range: ', JSON.stringify({ x: x, y: y, w: w, h: h, width: bitmap.width, height: bitmap.height })].join(''));
         }
      }
   }
   
   r /= area;
   g /= area;
   b /= area;
   
   return [r, g, b].map(Math.round);
}

module.exports = options => new ColorMapper(options);