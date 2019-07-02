var assert = require('chai').assert;


var {   createStreamFromArray , createFinalWritableStream } = require('./test_support/utilities.js');
var myPlugin = require('../index.js');
var vinylFile = require('vinyl');


describe('Testing the main gulp plugin : Section 1', function () {
   describe('Streaming mode section', function () {

      it("Testing in streaming mode :1", function (done) {
         var fakeStream = createStreamFromArray(['well hello there', '\n this import "hello/twist.scss" ;', "\n part should be there"]);

         var fakeFile = new vinylFile({
            contents : fakeStream ,
         });
          
         var myPluginTransformStream = new myPlugin();

         myPluginTransformStream.once('data', function (file) {
            assert(file.isStream(), 'The file should be a stream (a stream of objects)');
            file.contents.pipe(createFinalWritableStream(function (err, data) {
              
               assert.equal(data, 'well hello there\n this  part should be there');
               done();
            }));

         });

         myPluginTransformStream.write(fakeFile);
         myPluginTransformStream.end();

      });

      it('Testing in streaming mode :2', function(done){
         var fakeStream = createStreamFromArray(['hello there', 'how are you']);
         var fakeFile = new vinylFile({
            contents : fakeStream,
         });

         var myPluginTransformStream = new myPlugin();

         myPluginTransformStream.once('data', function(file){
            assert(file.isStream());
            file.contents.pipe(createFinalWritableStream(function(err,data){
               assert.equal(data,'hello therehow are you');
               done();
            }));
         });
         myPluginTransformStream.write(fakeFile);
         myPluginTransformStream.end();
      })
   });

   describe("Buffer Mode section " , function(){
      it('Testing in buffer mode :1' , function(done){
           var fakeFile = new vinylFile({
              contents :  Buffer.from('hellothere; how are you; import "abcd.scss";\nnew new')
           });
           var myPluginTransformStream = new myPlugin();

           myPluginTransformStream.once('data',function(file){
              assert(file.isBuffer(), 'The file contents should be a buffer');
              
              assert.equal(file.contents.toString(),'hellothere; how are you; new new');
              done();
           });

           myPluginTransformStream.write(fakeFile);
           myPluginTransformStream.end();
           
      });
      it('Testing in buffer mode : 2' , function(done){
         var fakeFile = new vinylFile({
            contents : Buffer.from("Samesamesame")

         });
         var myPluginTransformStream = new myPlugin();

         myPluginTransformStream.once('data', function(file){
            assert(file.isBuffer());
            assert.equal(file.contents.toString() , 'Samesamesame');
            done();

         });
         myPluginTransformStream.write(fakeFile);
         myPluginTransformStream.end();
      })
   })
});