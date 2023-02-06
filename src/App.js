import { useState, useEffect } from "react";
import { MuseClient } from 'muse-js';
import LineChart from "./components/LineChart";
import LineChartAutoScale from "./components/LineChartAutoScale";
import Modal from "./components/Modal";
import {Helmet} from "react-helmet";
// import ModalTwoStage from "./components/ModalTwoStage";
import logo from './static/logo.svg';
import "./App.css";

// import museWorker from "./workerFile.js";

const numEEGChannels = 4;
const numACCChannels = 3;
const numGYRChannels = 3;
const numPPGChannels = 3;

const showPerformanceLogs = false;
const isPlottingEnabled = false;

const plotSizeACC = 50;
const plotSizeOther = 100;
const standardRecordingTime = 5000;


var refreshRate = 1; //1000/256; // trying to refresh every ms 
var recordingTime = standardRecordingTime; // in ms
var plotSize = plotSizeOther; // Number of points to show at once
var modality = "EEG";

// var museDataGlobal = Array(numChannels).fill([]); // makes the waves square for some reason???
var museDataGlobal = [[],[],[],[],[],[]];
var dataPointID = 0;
var recordedCSV = [];
var currentEEGDataPoint = null;
var currentACCDataPoint = null;
var currentGYRDataPoint = null;
var currentPPGDataPoint = null;

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
var isSafeToRecordNextTick = true;

var partialDP = [undefined, undefined, undefined, undefined];

// var worker = undefined;
var headset = undefined;
var lastTime = window.performance.now();

// Init the refresh rate
if(modality == "EEG"){ // The refresh rate is different for different modalities
  refreshRate = 1000/256; // 256Hz in ms
  // recordingTime = standardRecordingTime * 3; // we change this since EEG needs every 3 samples
  // refreshRate = 1000/(256/3); // 256Hz in ms // museJS sends every 3 samples, so refresh every 3 steps
} else {
  // recordingTime = standardRecordingTime;
  refreshRate = 1000/64; // 256Hz in ms
}



function App() {
  const [generatedWaves, setGeneratedWaves] = useState([[],[],[],[],[]]); // For Generating Static Sample Waves
  const [museData, setMuseData] = useState(museDataGlobal);
  const [chartColors, setChartColors] = useState(['#7967e1', '#527ae8', '#2689e7', '#0095e0', '#1b9fd6', '#14bae3']);
  const [modalHidden, setModalHidden] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recordButtonText, setRecordButtonText] = useState("Record");
  const [modalStage, setModalStage] = useState(false);
  const [modalBody, setModalBody] = useState("To begin, select either the electroencephalography, the accelerometer, the gyroscope, or the photoplethysmography, modality.");
  // const [modality, setModality] = useState("ACC");

  useEffect(() => {

    // For Generating Static Sample Waves
    // var numSamples = 7;
    // setGeneratedWaves([
    //   generateWave(30, 40, numSamples, plotSize),
    //   generateWave(13, 30, numSamples, plotSize),
    //   generateWave(8, 13, numSamples, plotSize),
    //   generateWave(4, 8, numSamples, plotSize),
    //   generateWave(1, 4, numSamples, plotSize)
    // ]);

    // Random Data Generation
    setInterval(() => {
      if(isDataSimulated) {
        currentEEGDataPoint = [Math.random(), Math.random(), Math.random(), Math.random()];
        currentACCDataPoint = [Math.random(), Math.random(), Math.random()];
        currentGYRDataPoint = [Math.random(), Math.random(), Math.random()];
        currentPPGDataPoint = [Math.random(), Math.random(), Math.random()];
      }
    }, refreshRate);

    // Reading Data From Muse is Handled in its Own Subscription

    // Recording
    setInterval(() => {
      if(isCurrentlyRecording && isSafeToRecordNextTick) {
        if(modality == "EEG"){
          // recordedCSV.push(currentEEGDataPoint);
          recordedCSV.push(...currentEEGDataPoint);
        } else if (modality == "ACC") {
          recordedCSV.push(currentACCDataPoint);
        } else if (modality == "GYR") {
          recordedCSV.push([...currentGYRDataPoint, ...currentACCDataPoint]);
        } else if (modality == "PPG") {
          recordedCSV.push(currentPPGDataPoint);
        }
        if(recordedCSV.length >= (recordingTime/refreshRate)) { // recordingTime/refreshRate = number of samples to be recorded.
          stopRecording();
        }
        isSafeToRecordNextTick = false; // Needs to be ready to record tick if updated by the muse subscriber
      }
    }, refreshRate);


    // Vary the plotting rate for performance reasons
    setInterval(() => {
      lastNPlotTimes.push(window.performance.now()-lastTime);
      if(lastNPlotTimes.length >= plotResolutionWindow) {lastNPlotTimes.shift();}
      var lastNAvg = lastNPlotTimes.reduce((a, b) => a + b, 0) / lastNPlotTimes.length;

      if(showPerformanceLogs) {
        console.log(`${(window.performance.now()-lastTime).toFixed(5)}ms`.padEnd(15) + "| " +  `${lastNAvg.toFixed(5)}`.padEnd(10) + "| " + `${plotResolution}`);
      }

      lastTime = window.performance.now();

      if(plotResolutionCount % plotResolutionUpdateFrequency == 0) {
        if      ( lastNAvg > refreshRate+2 && plotResolution < maxPlotResolution ) { plotResolution += 1; }
        else if ( lastNAvg < refreshRate+1 && plotResolution > minPlotResolution ) { plotResolution -= 1; }
        plotResolutionCount = 0;
      }
      plotResolutionCount += 1;
    }, refreshRate);


    // Plotting
    if(isPlottingEnabled) {
    setInterval(() => {
      dataPointID += 1;
      if(dataPointID % plotResolution != 0) {
        return; // skip every n = plotResolution points for performance reasons
      }

      if(modality == "EEG"){
        for(var i = 0; i < numEEGChannels; i++) {
          // Add the data to the array
          museDataGlobal[i].push({
            id: dataPointID,
            e1: currentEEGDataPoint[i],
          });
          // Shift the chart
          if(museDataGlobal[i].length >= plotSize) {
            museDataGlobal[i].shift();
          }
        }
      } else if (modality == "ACC") {
        for(var i = 0; i < numACCChannels; i++) {
          // Add the data to the array
          museDataGlobal[i].push({
            id: dataPointID,
            e1: currentACCDataPoint[i],
          });
          // Shift the chart
          if(museDataGlobal[i].length >= plotSize) {
            museDataGlobal[i].shift();
          }
        }
        for(var i = 0; i < numGYRChannels; i++) {
          // Add the data to the array
          museDataGlobal[i + numACCChannels].push({
            id: dataPointID,
            e1: currentGYRDataPoint[i],
          });
          // Shift the chart
          if(museDataGlobal[i + numACCChannels].length >= plotSize) {
            museDataGlobal[i + numACCChannels].shift();
          }
        }
      } else if (modality == "PPG") {
        for(var i = 0; i < numPPGChannels; i++) {
          // Add the data to the array
          museDataGlobal[i].push({
            id: dataPointID,
            e1: currentPPGDataPoint[i],
          });
          // Shift the chart
          if(museDataGlobal[i].length >= plotSize) {
            museDataGlobal[i].shift();
          }
        }
      }
      // Set the data
      setMuseData([...museDataGlobal]); // need to do so the ... so React thinks its new
    }, refreshRate);
    }


  }, []);


  function dismissModalSimulate() {
    setModalHidden(true);
    isRecordButtonHidden = true;
    isConnectButtonHidden = false;
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
    } else {
      console.error("Attempted to start recording while there was a recording in progress.");
    }

    // setTimeout(() => { // If we want to allow users to terminate recording
    //   toggleRecording();
    // }, recordingTime);
  }

  async function stopRecording() {
    if(isCurrentlyRecording) {
      setRecordButtonText("Saving...");
      isCurrentlyRecording = false;

      await downloadCSV(recordedCSV);

      setTimeout(() => {setRecordButtonText("Record")}, 1000);

    } else {
      console.error("Attempted to stop recording while nothing was in progress.");
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
    try {
      // Begin connecting
      setIsConnecting(true);

      // Connect
      headset = new MuseClient();

      headset.enablePpg = true;

      await headset.connect();
      await headset.start();
      headset.eegReadings$ = headset.eegReadings;      
      // headset.enableAux = true


      // Setup the subscription to EEG data
      headset.eegReadings.subscribe(reading => {
        var se = reading.samples;

        // console.log(isSafeToRecordNextTick, recordedCSV.length, (window.performance.now()-lastTime).toFixed(2));
        
        // console.log(reading.electrode, window.performance.now()-lastTime, reading.samples);

        partialDP[reading.electrode] = [se[0], se[1], se[2], se[3], se[4], se[5], se[6], se[7], se[8], se[9], se[10], se[11]];
        // partialDP[reading.electrode] = [(se[0]/2000)+0.5, (se[1]/2000)+0.5, (se[2]/2000)+0.5, (se[3]/2000)+0.5, (se[4]/2000)+0.5, (se[5]/2000)+0.5, (se[6]/2000)+0.5, (se[7]/2000)+0.5, (se[8]/2000)+0.5, (se[9]/2000)+0.5, (se[10]/2000)+0.5, (se[11]/2000)+0.5];

        // currentEEGDataPoint = [se[0], se[1], se[2], se[3]]; //-1000 to 1000
        // currentEEGDataPoint    = [(se[0]/2000)+0.5, (se[1]/2000)+0.5, (se[2]/2000)+0.5, (se[3]/2000)+0.5]; //0 to 1
        // currentEEGDataPointRec = [[se[0], se[1], se[2], se[3]], [se[4], se[5], se[6], se[7]], [se[8], se[9], se[10], se[11]]]

        // console.log(se);

        if(partialDP[0] !== undefined && partialDP[1] !== undefined && partialDP[2] !== undefined && partialDP[3] !== undefined) {
          var out = [];
          for(var i = 0; i < partialDP[0].length; i++) {
            out.push([partialDP[0][i], partialDP[1][i], partialDP[2][i], partialDP[3][i]]);
          }

          

          // currentEEGDataPoint = partialDP;
          currentEEGDataPoint = out;
          isSafeToRecordNextTick = true;
          // console.log((window.performance.now()-lastTime).toFixed(2), currentEEGDataPoint);
          partialDP = [undefined, undefined, undefined, undefined];
        }
      });

      // Setup the subscription to GYR/ACC data
      headset.gyroscopeData.subscribe(reading => {
        var sg = reading.samples;
        // currentGYRDataPoint = [sg[2].x, sg[2].y, sg[2].z]; //-255 to +255
        currentGYRDataPoint = [(sg[2].x/510)+0.5, (sg[2].y/510)+0.5, (sg[2].z/510)+0.5]; //0 to 1
        // console.log("GYR", currentGYRDataPoint);
      });
      headset.accelerometerData.subscribe(reading => {
        var sa = reading.samples;
        // currentACCDataPoint = [sa[2].x, sa[2].y, sa[2].z]; //-2 to +2
        currentACCDataPoint = [(sa[2].x/4)+0.5, (sa[2].y/4)+0.5, (sa[2].z/4)+0.5]; //0 to 1
        // console.log("ACC", currentACCDataPoint);
      });

      // Setup the subscription to PPG data
      headset.ppgReadings.subscribe(reading => {
        var sp = reading.samples;
        currentPPGDataPoint = [sp[0], sp[1], sp[2]];
        // console.log("PPG", currentPPGDataPoint);
        // console.log(sp);
      });


      // Connected successfully
      dismissModalConnect();
      isDataSimulated = false;
      setTimeout(() => {setIsConnecting(false);}, 1000); // Timeout so that the connection animation is smooth
      
    } catch (err) {
      setIsConnecting(false);
      console.error("Connection error: " + err);
    }
  }

  function generateWave(minFreq, maxFreq, numLayers, nPoints) {
    // Create range
    var time = [...Array(nPoints).keys()].map(x => x);
    var wave = [...Array(nPoints).keys()].map(x => 0);

    // Generate n layers
    for(var i = 0; i < numLayers; i++) {

      // Create wave
      var freq = randomFromInterval(minFreq, maxFreq);
      var amp = randomFromInterval(1, 100);
      var currentWave = time.map(x => Math.sin((x/100) * freq * Math.PI) * amp);
      
      // Add together with the existing wave
      for(var j = 0; j < nPoints; j++) {
        wave[j] += currentWave[j];
      }
    }

    // Convert wave to the output shape the chart wants
    var waveOut = []
    for(var j = 0; j < nPoints; j++) {
      waveOut.push({
        id: j,
        e1: wave[j],
      })
    }

    return waveOut;
  }

  function randomFromInterval(min, max) { // min and max included 
    return Math.random() * (max - min + 1) + min
  }

  function testFunc() {
    console.log("modality", modality);
  }

  function updateModalStage(event) {
    modality = event;
    setModalStage(true);
    setModalBody("If you do not have a device to connect, you can simulate the data.");
  }

  function switchModality(mode) {
    modality = mode; // Switch
    museDataGlobal = [[],[],[],[],[],[]]; // Empty all arrays

    if(mode == "ACC") { // ACC plots a lot.. Cut down the max plot size so performance is constant
      plotSize = plotSizeACC;
    } else {
      plotSize = plotSizeOther;
    }

    if(mode == "EEG"){ // The refresh rate is different for different modalities
      // refreshRate = 1000/256; // 256Hz in ms
      recordingTime = standardRecordingTime * 3; // we change this since EEG needs every 3 samples
      refreshRate = 1000/(256/3); // 256Hz in ms // museJS sends every 3 samples, so refresh every 3 steps
    } else {
      recordingTime = standardRecordingTime;
      refreshRate = 1000/64; // 256Hz in ms
    }
  }


  let plotLine = [<div></div>, <div></div>, <div></div>, <div></div>, <div></div>, <div></div>];
  if (modality == "EEG") {
    plotLine[0] = <LineChart chartData={museData[0]} chartColor={chartColors[0]} />;
    plotLine[1] = <LineChart chartData={museData[1]} chartColor={chartColors[1]} />;
    plotLine[2] = <LineChart chartData={museData[2]} chartColor={chartColors[2]} />;
    plotLine[3] = <LineChart chartData={museData[3]} chartColor={chartColors[3]} />;
  }
  if (modality == "ACC") {
    plotLine[0] = <LineChart chartData={museData[0]} chartColor={chartColors[0]} />;
    plotLine[1] = <LineChart chartData={museData[1]} chartColor={chartColors[0]} />;
    plotLine[2] = <LineChart chartData={museData[2]} chartColor={chartColors[0]} />;
    plotLine[3] = <LineChart chartData={museData[3]} chartColor={chartColors[4]} />;
    plotLine[4] = <LineChart chartData={museData[4]} chartColor={chartColors[4]} />;
    plotLine[5] = <LineChart chartData={museData[5]} chartColor={chartColors[4]} />;
  }
  if (modality == "PPG") {
    plotLine[0] = <LineChartAutoScale chartData={museData[0]} chartColor={chartColors[0]} />;
    plotLine[1] = <LineChartAutoScale chartData={museData[1]} chartColor={chartColors[2]} />;
    plotLine[2] = <LineChartAutoScale chartData={museData[2]} chartColor={chartColors[4]} />;
  }


  return (
    <div className="App">
      {/* <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
      </Helmet> */}

      <header className="App-header">
        <a href="https://neuralberta.tech" rel="noopener noreferrer">
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

        {/* <ModalTwoStage
          title={"Connect Hardware"}
          body={modalBody}
          primaryButtonText={"Connect"}
          primaryButtonOnClick={connect}
          secondaryButtonText={"Simulate"}
          secondaryButtonOnClick={dismissModalSimulate}
          isConnecting={isConnecting}
          hidden={modalHidden}
          stage={modalStage}
          updateStage={updateModalStage}
        /> */}


        <div className="App-position-top-right">
          <div className="App-data-type-text" onClick={testFunc}>{modality} | {isDataSimulated ? 'Simulated Data' : 'Live Data'}</div>
        </div>



        {/* For Plotting EEG */}
        {/* <div className={`App-chart-container ${modality == "EEG" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[0]} chartColor={chartColors[0]} />
        </div>
        <div className={`App-chart-container ${modality == "EEG" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[1]} chartColor={chartColors[1]} />
        </div>
        <div className={`App-chart-container ${modality == "EEG" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[2]} chartColor={chartColors[2]} />
        </div>
        <div className={`App-chart-container ${modality == "EEG" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[3]} chartColor={chartColors[3]} />
        </div> */}
        {/* For Plotting EEG */}

        {/* For Plotting ACC */}
        {/* <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[0]} chartColor={chartColors[0]} />
        </div>
        <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[1]} chartColor={chartColors[0]} />
        </div>
        <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[2]} chartColor={chartColors[0]} />
        </div>
        <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[3]} chartColor={chartColors[4]} />
        </div>
        <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[4]} chartColor={chartColors[4]} />
        </div>
        <div className={`App-chart-container ${modality == "ACC" ? "" : "App-hidden"}`}>
          <LineChart chartData={museData[5]} chartColor={chartColors[4]} />
        </div> */}
        {/* For Plotting ACC */}

        {/* For Plotting PPG */}
        {/* <div className={`App-chart-container ${modality == "PPG" ? "" : "App-hidden"}`}>
          <LineChartAutoScale chartData={museData[0]} chartColor={chartColors[0]} />
        </div>
        <div className={`App-chart-container ${modality == "PPG" ? "" : "App-hidden"}`}>
          <LineChartAutoScale chartData={museData[1]} chartColor={chartColors[2]} />
        </div>
        <div className={`App-chart-container ${modality == "PPG" ? "" : "App-hidden"}`}>
          <LineChartAutoScale chartData={museData[1]} chartColor={chartColors[4]} />
        </div> */}
        {/* For Plotting PPG */}





        <div className={`App-chart-container ${modality == "PPG" || modality == "EEG" || modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[0]}
        </div>
        <div className={`App-chart-container ${modality == "PPG" || modality == "EEG" || modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[1]}
        </div>
        <div className={`App-chart-container ${modality == "PPG" || modality == "EEG" || modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[2]}
        </div>
        <div className={`App-chart-container ${                     modality == "EEG" || modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[3]}
        </div>
        <div className={`App-chart-container ${                                          modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[4]}
        </div>
        <div className={`App-chart-container ${                                          modality == "ACC" ? "" : "App-hidden"}`}>
          {plotLine[5]}
        </div>












        {/* For Generating Static Sample Waves */}
        {/* <div className="App-chart-container">
          <LineChart chartData={generatedWaves[0]} chartColor={chartColors[0]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={generatedWaves[1]} chartColor={chartColors[1]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={generatedWaves[2]} chartColor={chartColors[2]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={generatedWaves[3]} chartColor={chartColors[3]} />
        </div>
        <div className="App-chart-container">
          <LineChart chartData={generatedWaves[4]} chartColor={chartColors[4]} />
        </div> */}
        {/* For Generating Static Sample Waves */}



        <div className={'App-position-lower-right App-button-container App-fade-in-animation'}>
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
          >
            Connect
          </div>
        </div>
        



        <div className={'App-button-container-vertical App-position-lower-left App-fade-in-animation'}>
          {/* <div
            className={`App-button App-button-fill-space App-button-default`}
            onClick={() => window.open("https://neuralberta.tech/colab", "_blank")}
          >
            Colab
          </div> */}

          <div className={'App-button-container-horizontal'}>
            <div
              className={`App-button App-button-mini App-button-default ${modality == "EEG" ? "App-button-default-active" : ""}`}
              onClick={() => {switchModality("EEG")}}
            >
              EEG
            </div>
            <div
              className={`App-button App-button-mini App-button-default ${modality == "ACC" ? "App-button-default-active" : ""}`}
              onClick={() => {switchModality("ACC")}}
            >
              ACC
            </div>
            <div
              className={`App-button App-button-mini App-button-default ${modality == "PPG" ? "App-button-default-active" : ""}`}
              onClick={() => {switchModality("PPG")}}
            >
              PPG
            </div>
          </div>
        </div>




        <div
          className={`App-button App-button-default App-position-lower-center App-fade-in-animation`}
          onClick={() => window.open("https://neuralberta.tech/colab", "_blank")}
        >
          Colab
        </div>
      


      </div>
    </div>
  );
}

export default App;