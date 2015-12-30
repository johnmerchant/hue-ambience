"use strict";

const stream = require('stream');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

const bmp = require('bmp-js');
const hex = require('hex');

class BitmapStream extends stream.Transform {
   
   constructor(options) {
      super({ readableObjectMode: true });
      
      this._i = 0;
      this._length = 0;
      this._buffer = null;
   }
   
   _transform(chunk, encoding, callback) {
      
      if (this._buffer === null) {
         if (chunk.length < 6) {
            this._buffer = new Buffer(6);
         } else {
            this._length = chunk.readUInt32LE(2);
            this._buffer = new Buffer(this._length);
         }
      }
      
      if (this._length === 0) {
         if (chunk.length + this._i > 6) {
            let buf = this._buffer;
            chunk.copy(buf, this._i, 0, 6 - this._i);
            this._length = chunk.readUInt32LE(2);
            this._buffer = new Buffer(this._length);
            buf.copy(this._buffer);
            this._i = 5;
         } else {
            chunk.copy(this._buffer);
            this._i += chunk.length;
         }
      }
      
      if (chunk.length + this._i > this._length) {
         let offset = chunk.length + this._i - this._length;
         let buf = new Buffer(offset);

         chunk.copy(this._buffer, this._i, 0, offset);
         chunk.copy(buf, 0, this._length - 1);

         this._decode(callback);
         this._transform(buf, encoding);
      } else {
         chunk.copy(this._buffer, this._i);
         this._i += chunk.length;
         
         if (this._i > this._length - 1) {
            this._decode(callback);
            return;
         }
      }
      
      if (callback) {
         callback();
      }
   }
   
   _decode(callback) {
      try {
         callback(null, bmp.decode(this._buffer));
      } catch (err) {
         callback(err);
      } finally {
         this._buffer = null;
         this._i = 0;
         this._length = 0;
      }
   }
   
   _flush(callback) {
      if (this._i > this._length) {
         this._decode(callback);
      } else {
         callback();
      }
   }
}

module.exports = options => new BitmapStream(options);