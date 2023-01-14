// self.addEventListener('message', function(e) {
//   console.log("worker.js", e);
// });


/* eslint-disable no-restricted-globals */
// import { profiles } from "../data";
// import { processList } from "./enums";

self.onmessage = (e) => {
  console.log("here", e);
};

export {};
