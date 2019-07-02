// This plugin has been developed and tested for node 10.15.3(LTS) API. 

let PluginError = require('plugin-error');

const PLUGIN_NAME = "gulp-remove-import-scss-lines";

const {
   StringDecoder
} = require('string_decoder');

let Transform = require('stream').Transform;


//The new tranform class
class FileContentsTransformer extends Transform {
   constructor(options) {
      super(options);
      var backup_length = options.backup_length;
      var tail = "";
      var to_match = /\bimport\b\s+["'][\.\/\w]+\.scss["']\s*;?\n/g;
      var decoder = new StringDecoder();


      //We declare the _transform function and the _flush function here in the constructor to have access to local variables through closure.
      this._transform = function (chunk, encoding, callback) {

         var haystack = tail + decoder.write(chunk);
         tail = "";
         var matches;
         var lastPosition = 0;
         var matchCount = 0;
         var rewritten = "";
         while ((matches = to_match.exec(haystack)) !== null) {
            matchCount++;
            var before = haystack.slice(lastPosition, matches.index);
            lastPosition = matches.index + matches[0].length;
            rewritten = rewritten + before;

         }

         if (haystack.slice(lastPosition).length > backup_length) {
            tail = haystack.slice(lastPosition).slice(0 - backup_length);
         } else {
            tail = haystack.slice(lastPosition);
         }

         var dataToSend = getDataToSend(matchCount, haystack, rewritten, lastPosition);

         callback(null, dataToSend);

      }

      this._flush = function (callback) {
         if (tail) {
            this.push(tail);
         }

         callback();
      }

      var getDataToSend = function (matchCount, haystack, rewritten, lastPosition) {

         if (matchCount > 0) {
            return rewritten + haystack.slice(lastPosition, haystack.length - tail.length);
         }

         return haystack.slice(0, haystack.length - tail.length);

      }


   }


}



class RemoveScssTransformer extends Transform {
   constructor(options) {
      super(options);
      this.backup_length = options.backup_length;
   }

   _transform(file, encoding, callback) {
      //If the file is null , as in a symbolic link , just return it

      if (file.isNull()) {
         return callback(null, file);
      }

      if (file.isBuffer()) {

         var strContent = file.contents.toString();
         var to_match = /\bimport\b\s+["'][\.\/\w]+\.scss["']\s*;?\n/g;

         var newStrContent = strContent.replace(to_match, "");

         file.contents = Buffer.from(newStrContent);
         this.push(file);
         return callback();


      } else if (file.isStream()) {
         //dealing with the case that the file is a stream

         var new_stream = new FileContentsTransformer({
            'backup_length': this.backup_length
         });
         new_stream.on('error', this.emit.bind(this, 'error'));
         file.contents = file.contents.pipe(new_stream);
         return callback(null, file);
      }



      callback(new PluginError(PLUGIN_NAme, " The transform file is neither of null , buffer , or stream "));


   }
}


module.exports = function (options = {}) {
   if (options.backup_length === undefined) {
      options.backup_length = 100;
   }

   if (typeof options.backup_length !== "number") {
      throw (new PluginError(PLUGIN_NAME, "The options.backup_length variable should be a number"));
   }

   if (typeof options.backup_length < 0) {
      throw (new PluginError(PLUGIN_NAME, 'The options.backup_length parameter should be greater than 0'))

   }

   var backup_length = Math.floor(options.backup_length);

   return new RemoveScssTransformer({
      'backup_length': backup_length,
      'objectMode': true
   });


}