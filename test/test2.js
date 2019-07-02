// This tests the test_support utilities

var assert = require('chai').assert;
var {createStreamFromArray ,createFinalWritableStream } = require('./test_support/utilities.js');
var sinon = require('sinon');

afterEach(()=> {
   sinon.restore();
})

describe('Testing support files : Section1', function(){
  
   describe('Section-a', function(){
      
       it('should be a proper stream' , function(done){
          let testArray = ['hello','how','are','you'];
          let testStream = createStreamFromArray(testArray);
          testStream.setEncoding('utf8');
          let responseData = "";

          testStream.on('data' , function(data){
             responseData = responseData + data;
          })

          testStream.on('end', function(){
             
             if(responseData === "hellohowareyou"){
                done();
             }else{
                done(new Error('the stream input data and output data do not match'));
             }
          })
       });
       it('should be a proper stream 2 ' , function(done){
          let testArray = ['testing\n','\n\nt','uv'];
          let testStream = createStreamFromArray(testArray);
          testStream.setEncoding('utf8');
          let responseData ="";
          testStream.on('data', function(data){
             responseData = responseData + data ;

          });

          testStream.on('end',function(){
             if(responseData === "testing\n\n\ntuv"){
                done();
             }
             else{
                done(new Error('the stream input data and output data do not match'));
             }
          })


          
       })
   });

   describe('WtitableStream Section' , function(){

      it('should be a properWriteStream', function(done){
         let callbackFunction = sinon.spy(function(data){
           
         });
         let writableStream = createFinalWritableStream(callbackFunction);

         let buffer1 = Buffer.from("This is the first string");
         let buffer2 = Buffer.from("This is the second string");
         let buffer3 = Buffer.from("This is the final string");
         let message = "This is the first stringThis is the second stringThis is the final string";
         writableStream.on('finish' , () => {

            assert(callbackFunction.calledOnce, "The callback should be called only once") ;
            assert.strictEqual(callbackFunction.getCall(0).args[1] , message);
            done();

         });
         writableStream.write(buffer1);
         writableStream.write(buffer2);
         writableStream.end(buffer3);
         

      })
   })

});