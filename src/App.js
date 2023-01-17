import { useState, useMemo, useEffect } from "react";
import { MuseClient } from 'muse-js';
import LineChart from "./components/LineChart";
import Modal from "./components/Modal";
import logo from './static/logo.svg';
// import connect from museConnect;
import "./App.css";

// import museWorker from "./workerFile.js";


const numChannels = 5;
const plotSize = 100; // Number of points to show at once
const refreshRate = ((1000/256)); // 256Hz in ms
const recordingTime = 5000; // in ms

// var museDataGlobal = Array(numChannels).fill([]); // makes the waves square somehow???
var museDataGlobal = [[],[],[],[],[]];
var dataPointID = 0;
var recordedCSV = [];
var currentDataPoint = null;

var plotResolution = 3; // Number of points to skip, lower is higher res
var lastNPlotTimes = [];
var plotResolutionUpdateFrequency = 100;
var plotResolutionWindow = 100;
var plotResolutionCount = 0;
var minPlotResolution = 3;
var maxPlotResolution = 200;

var isRecordButtonHidden = true;
var isConnectButtonHidden = true;
var isCurrentlyRecording = false;
var isDataSimulated = true;

// var worker = undefined;
var headset = undefined;

var lastTime = window.performance.now();


function App() {
  const [museData, setMuseData] = useState(museDataGlobal);
  const [chartColors, setChartColors] = useState(['#7967e1', '#527ae8', '#2689e7', '#0095e0', '#1b9fd6']);
  const [modalHidden, setModalHidden] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recordButtonText, setRecordButtonText] = useState("Record");


  useEffect(() => {

    // Random Data Generation
    setInterval(() => {
      if(isDataSimulated) {
        currentDataPoint = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
      }
    }, refreshRate);



    // Vary the plotting rate for performance reasons
    setInterval(() => {
      lastNPlotTimes.push(window.performance.now()-lastTime);
      if(lastNPlotTimes.length >= plotResolutionWindow) {lastNPlotTimes.shift();}
      var lastNAvg = lastNPlotTimes.reduce((a, b) => a + b, 0) / lastNPlotTimes.length;

      console.log(`${(window.performance.now()-lastTime).toFixed(5)}ms`.padEnd(15) + "| " +  `${lastNAvg.toFixed(5)}`.padEnd(10) + "| " + `${plotResolution}`);

      lastTime = window.performance.now();

      if(plotResolutionCount % plotResolutionUpdateFrequency == 0) {
        if(      lastNAvg > refreshRate+2 && plotResolution < maxPlotResolution) { plotResolution += 1; }
        else if (lastNAvg < refreshRate+1 && plotResolution > minPlotResolution) { plotResolution -= 1; }
        plotResolutionCount = 0;
      }
      plotResolutionCount += 1;
    }, refreshRate);


    // Plotting
    setInterval(() => {
      dataPointID += 1;
      // console.log("md", museDataGlobal);

      if(dataPointID % plotResolution != 0) {
        return; // skip every n = plotResolution points so that the plot "moves" slower
      }

      for(var i = 0; i < numChannels; i++) {
        // Add the data to the array
        museDataGlobal[i].push({
          id: dataPointID,
          e1: currentDataPoint[i],
        });
  
        // Shift the chart
        if(museDataGlobal[i].length >= plotSize) {
          museDataGlobal[i].shift();
        }
      }


      // Set the data
      setMuseData([...museDataGlobal]); // need to do so the ... so react thinks its new
      // setCharts({
      //   museData: [...museDataGlobal],
      //   chartColors: chartColors
      // }); // need to do so the ... so react thinks its new

    }, refreshRate);

    // Recording
    setInterval(() => {
      if(isCurrentlyRecording) {
        recordedCSV.push(currentDataPoint);
        // console.log(recordedCSV.length);
        if(recordedCSV.length >= (recordingTime/refreshRate)) { // recordingTime/refreshRate = number of samples to be recorded.
          stopRecording();
        }
      }
    }, refreshRate);
  }, []);


  function dismissModalSimulate() {
    setModalHidden(true);
    isRecordButtonHidden = true;
    isConnectButtonHidden = false; // to allow for connecting later
    // Actually start showing simulated data maybe?????
  }

  function dismissModalConnect() {
    setModalHidden(true);
    isRecordButtonHidden = false;
    isConnectButtonHidden = true;
  }

  function spawnModal() {
    setModalHidden(false);
    isRecordButtonHidden = true;
    isConnectButtonHidden = true;
  }

  function beginRecording() {
    if(!isCurrentlyRecording) {
      recordedCSV = []; // Reset
      setRecordButtonText("");
      isCurrentlyRecording = true;
      // plotResolution = 100; // Plot really slowly to save resources
    } else {
      console.error("Attempted to start recording while there was one in progress.");
    }

    // setTimeout(() => { // Old way to stop recording. Now we stop the recording at a specified number of samples.
    //   toggleRecording();
    // }, recordingTime);
  }

  async function stopRecording() {
    if(isCurrentlyRecording) {
      setRecordButtonText("Saving...");
      isCurrentlyRecording = false;
      // plotResolution = 1; // We can plot fast again

      await downloadCSV(recordedCSV);

      setTimeout(() => {setRecordButtonText("Record")}, 1000);

    } else {
      console.error("Attempted to stop recording while there wasn't one in progress.");
    }
  }

  async function downloadCSV(dataMatrix) {
    let csvContent = "data:text/csv;charset=utf-8," + dataMatrix.map(e => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Brainwaves_${Date.now()}.csv`);
    document.body.appendChild(link);

    link.click(); 
  }

  


  // TODO import this
  async function connect() {
    // let client = new MuseClient();
    // await client.connect();
    // await client.start();


    // console.log("short return, pretend we succeeded");
    // dismissModalConnect();
    // return;

    try {
      // Begin connecting
      setIsConnecting(true);


      // worker = new Worker(museWorker);
      // // worker.onmessage = ev => {
      // //   console.log("got data back from worker");
      // //   console.log(ev);
      // // };

      // worker.postMessage("start");

      // // Connect
      // window.headset = new MuseClient();
      // window.headset.enableAux = window.enableAux;
      // await window.headset.connect();
      // await window.headset.start();
      // window.headset.eegReadings$ = window.headset.eegReadings; // why??

      // // Setup the subscription to data
      // window.headset.eegReadings.subscribe(reading => {
      //   console.log(`time ${Date.now() - lasttime}ms`);
      //   lasttime = Date.now();

      //   var s = reading.samples;
      //   currentDataPoint = [s[0], s[1], s[2], s[3], s[4]];
      //   // console.log(s);
      // });





      // Connect
      headset = new MuseClient();
      await headset.connect();
      await headset.start();
      headset.eegReadings$ = headset.eegReadings;      

      // Setup the subscription to data
      headset.eegReadings.subscribe(reading => {
        // console.log(`${Date.now() - lasttime}ms`);
        // lasttime = Date.now();

        var s = reading.samples;
        currentDataPoint = [s[0], s[1], s[2], s[3], s[4]];
        // console.log(s);
      });


      // worker = new Worker(museWorker);
      // worker.postMessage({messageType: "connectHeadset", contents: headset});






      // Create worker, wait for message back saying it is connected...
      // worker = new Worker(new URL("../src/museWorker.js", import.meta.url), { type: "module" });

      // console.log("worker", worker);
      
      // worker.onmessage = function(e) {
      //   console.log("got data back from worker", e);
      // };
      
      
      // setTimeout(() => {        
      //   worker.postMessage({messageType: "connectHeadset", contents: "hello"});
      // }, 1000);


      // Connected successfully
      dismissModalConnect();
      isDataSimulated = false;
      setTimeout(() => {setIsConnecting(false);}, 1000); // Timeout so that the connection animation is smooth



      // window.headset.telemetryData.subscribe(telemetry => {
      //   console.log(telemetry);
      // });
      // window.headset.accelerometerData.subscribe(acceleration => {
      //   console.log(acceleration);
      // });


    } catch (err) {
      setIsConnecting(false);
      console.error("Connection error: " + err);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <a href="https://neuralberta.tech" target="_blank" rel="noopener noreferrer">
          <img src={logo} className="App-logo" alt="logo" />
        </a>
      </header>

      <div className="App-body">

        <Modal
          title={"Connect Hardware"}
          body={"To begin the demo, either connect hardware or use simulated data."}
          primaryButtonText={"Connect"}
          primaryButtonOnClick={connect}
          secondaryButtonText={"Simulate"}
          secondaryButtonOnClick={dismissModalSimulate}
          isConnecting={isConnecting}
          hidden={modalHidden}
        />


        <div className="App-position-top-right">
          <div className="App-data-type-text">{isDataSimulated ? 'Simulated Data' : 'Live Data'}</div>
        </div>


        {/* TODO make this a for loop??? */}
        <div className="App-chart-container">
          <LineChart chartData={museData[0]} chartColor={chartColors[0]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={museData[1]} chartColor={chartColors[1]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={museData[2]} chartColor={chartColors[2]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={museData[3]} chartColor={chartColors[3]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={museData[4]} chartColor={chartColors[4]} />
        </div>


        {/* should we allow stop or just record fixed interval?? */}
        <div
          className={`App-button App-button-record App-position-lower-right ${isRecordButtonHidden ? "App-hidden" : ""} ${isCurrentlyRecording ? "" : "App-button-record-hover-allowed"}`}
          onClick={beginRecording}
        >
          <div className={`${isCurrentlyRecording ? "App-hidden" : ""}`}>{recordButtonText}</div>
          <div className={`${isCurrentlyRecording ? "" : "App-hidden"} App-recording-circle`}></div>
        </div>

        <div
          className={`App-button App-button-connect App-position-lower-right ${isConnectButtonHidden ? "App-hidden" : ""}`}
          onClick={spawnModal}
        >Connect</div>


      </div>
    </div>
  );
}

export default App;