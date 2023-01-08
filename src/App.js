import { useState } from "react";
import { useEffect } from "react";
import { MuseClient } from 'muse-js';
import LineChart from "./components/LineChart";
import Modal from "./components/Modal";
import logo from './static/logo.svg';
import "./App.css";


const numChannels = 5;
const plotSize = 100; // Number of points to show at once
const plotResolution = 10; // Number of points to skip, lower is higher res
const refreshRate = ((1/256)*1000); // 256Hz in ms
const recordingTime = 5000; // in ms

// var museDataGlobal = Array(numChannels).fill([]); // makes the waves square somehow???
var museDataGlobal = [[],[],[],[],[]];
var dataPointID = 0;
var recordedCSV = [];

var isRecordButtonHidden = true;
var isConnectButtonHidden = true;
var isCurrentlyRecording = false;



function App() {
  // const [charts, setCharts] = useState({
  //   museData: museDataGlobal,
  //   chartColors: chartColors
  // });

  const [museData, setMuseData] = useState(museDataGlobal);
  const [chartColors, setChartColors] = useState(['#7967e1', '#527ae8', '#2689e7', '#0095e0', '#1b9fd6']);
  const [modalHidden, setModalHidden] = useState(false);
  const [recordButtonText, setRecordButtonText] = useState("Record");

  // Update the chart
  useEffect(() => {
    setInterval(() => {
      var value = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
      dataPointID += 1;
      // console.log("md", museDataGlobal);

      if(isCurrentlyRecording) {
        recordedCSV.push(value);
        console.log(recordedCSV.length);
        if(recordedCSV.length >= (recordingTime/refreshRate)) { // recordingTime/refreshRate = number of samples to be recorded.
          stopRecording();
        }
      }

      if(dataPointID % plotResolution != 0) {
        return; // skip every n = plotResolution points so that the plot "moves" slower
      }

      for(var i = 0; i < numChannels; i++) {
        // Add the data to the array
        museDataGlobal[i].push({
          id: dataPointID,
          e1: value[i],
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


    // setInterval(() => {console.log("main thing:", modalHidden)}, 1000);
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

      console.log("REC:", recordedCSV);
      await downloadCSV(recordedCSV);

      setRecordButtonText("Record");

    } else {
      console.error("Attempted to stop recording while there wasn't one in progress.");
    }
  }

  function downloadCSV(dataMatrix) {
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


    console.log("short return, pretend we succeeded");
    dismissModalConnect();
    return;

    try {
      // Connect with the Muse EEG Client
      // setStatus(generalTranslations.connecting);
      console.warn("connecting...")
      window.headset = new MuseClient();
      window.headset.enableAux = window.enableAux;
      await window.headset.connect();
      await window.headset.start();
      window.headset.eegReadings$ = window.headset.eegReadings; // why??
      // setStatus(generalTranslations.connected);
      alert("connected");

      window.headset.eegReadings.subscribe(reading => {
        console.log(reading.samples);
      });

      // window.headset.telemetryData.subscribe(telemetry => {
      //   console.log(telemetry);
      // });
      // window.headset.accelerometerData.subscribe(acceleration => {
      //   console.log(acceleration);
      // });



      // if (
      //   window.headset.connectionStatus.value === true &&
      //   window.headset.eegReadings$
      // ) {
      //   buildPipes(selected);
      //   subscriptionSetup(selected);
      // }

    } catch (err) {
      // setStatus(generalTranslations.connect);
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
          hidden={modalHidden}
        />


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
          className={`App-button App-button-record App-position-lower-right ${isRecordButtonHidden ? "App-hidden" : ""}`}
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