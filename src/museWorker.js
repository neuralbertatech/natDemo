/* eslint-disable no-restricted-globals */
// self.postMessage("Success");
import { MuseClient } from 'muse-js';

var headset = undefined;
const refreshRate = ((1000/256)); // 256Hz in ms
// // var lasttime = self.performance.now()


async function museWorkerCode() {
  
  // create the interval to connect to muse and begin streaming
  // (maybe have this as another onmessage thing from main triggered when muse connect request??)
  // NO! Spawn the worker in the muse startup code once connection is made: museWorker <=> museConnection


  // Connect
  console.log("before");
  headset = new MuseClient();
  // await headset.connect();
  // await headset.start();
  // headset.eegReadings$ = headset.eegReadings;
  console.log("after");

  // Setup the subscription to data
  // headset.eegReadings.subscribe(reading => {
  //   console.log(`${Date.now() - lasttime}ms`);
  //   lasttime = Date.now();

  //   var s = reading.samples;
  //   currentDataPoint = [s[0], s[1], s[2], s[3], s[4]];
  //   // console.log(s);
  // });



  // self.onmessage - acts as a fetch request, throw back the current state to be plotted when asked
  // also have onmessage for start recording
  // also have onmessage for stop recording

  self.postMessage("Success");
};


self.onmessage = function(e) {
  // figure out what to do with the message
  // var messageType = e.data.messageType;
  console.log("mtype:", e);

  // Init
  // if (type == connect)
  museWorkerCode();

  // self.postMessage("Success");



  // console.log("Message received from main script");

  // Post to main script
  // self.postMessage("Success");

  // console.log("starting muse streaming", e.data);

  // setInterval(() => {
  //   // console.log(`${refreshRate-(self.performance.now()-lasttime)}ms`);
  //   // lasttime = self.performance.now();
  //   console.log('tick');
  // }, refreshRate);
};




// // function test() {
// //   return new Promise((resolve) => {
// //     setTimeout(() => {
// //       resolve(10);
// //     }, 2000);
// //   });
// // }



// let code = museWorkerCode.toString();
// code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

// const blob = new Blob([code], { type: "application/javascript" });
// const museWorker = URL.createObjectURL(blob);

// export default museWorker;