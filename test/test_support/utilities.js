const {
   Readable , Writable
} = require('stream');

const { StringDecoder } = require('string_decoder');

const _private = new WeakMap();

const internal = function (key) {
   if (!_private.has(key)) {
      _private.set(key, {});
   }

   return _private.get(key);
}

class CustomReadableStream extends Readable {
   constructor(options) {
      var sampleArray = options.sampleArray;
      if (sampleArray != undefined) {
         delete options.sampleArray;
      } else {
         sampleArray = [""];
      }
      super(options);
      internal(this).sampleArray = sampleArray;
      internal(this).arrayPosition = 0;
      internal(this).arrayLength = sampleArray.length;

   }

   _read(size) {
      var sampleArray = internal(this).sampleArray;
      var arrayPosition = internal(this).arrayPosition;
      var arrayLength = internal(this).arrayLength;
      if (arrayPosition >= arrayLength) {
         this.push(null);
         return;
      } else {

         do {
            var more = this.push(sampleArray[arrayPosition] ,'utf8');
            arrayPosition++;
         } while ( more && (arrayPosition < arrayLength))
         
         if(more){
            this.push(null);
            return;
         }
         else {
            internal(this).arrayPosition = arrayPosition;
         }
         
      }
   }
}

class CustomWritableStream extends Writable {
   constructor(options){
      var  callback = options.callback;
      if ( callback == undefined){
         callback = () => {};
      }else {
         delete options.callback;
      }
      super(options);
      internal(this).data = "";
      internal(this).decoder = new StringDecoder('utf8');
      internal(this).callback = callback;
   }

   _write(chunk,encoding ,callback ){
      if(Buffer.isBuffer(chunk)){
        internal(this).data = internal(this).data + internal(this).decoder.write(chunk);
        callback();
        return;
      }
      if( typeof chunk === "string"){
         internal(this).data = internal(this).data + chunk;
         callback();
         return;
      }
      callback(new Error("chunk should either be string or buffer"));
   }

   _final(callback){
      var finalData = internal(this).data + internal(this).decoder.end();
      internal(this).callback(null , finalData);
      callback();
   }
}

function createStreamFromArray(sampleArray) {
   if (sampleArray == undefined) {
      throw new Error("createStreamFromArray function needs an array ");
   }

   if (!(Array.isArray(sampleArray))) {
      sampleArray = [sampleArray.toString()];
   }

   var options = {sampleArray : sampleArray} ;
   return new CustomReadableStream(options);


}
function createFinalWritableStream(callback){
   if (callback == undefined){
      callback = function(err ,data){
         console.log(data);
      }

   }
   var options = { callback : callback};
   return new CustomWritableStream(options);
}

module.exports = {createStreamFromArray : createStreamFromArray,
                  createFinalWritableStream : createFinalWritableStream};
