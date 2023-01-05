import { useState } from "react";
import { useEffect } from "react";
import { MuseClient } from 'muse-js';
import LineChart from "./components/LineChart";
import logo from './static/logo.svg';
import "./App.css";


const numChannels = 5;
const plotSize = 100; // Number of points to show at once
const plotResolution = 10; // Number of points to skip, lower is higher res
const refreshRate = ((1/256)*1000); // 256Hz in ms

// var museDataGlobal = Array(numChannels).fill([]); // makes the waves square somehow???
var museDataGlobal = [[],[],[],[],[]];
var dataPointID = 0;


// TODO import this
async function connect() {
  // let client = new MuseClient();
  // await client.connect();
  // await client.start();

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



function App() {
  const [museData, setMuseData] = useState(museDataGlobal);
  const [chartColors, setChartColors] = useState(['#7967e1', '#527ae8', '#2689e7', '#0095e0', '#1b9fd6']);


  // TODO, turn the museData into an n dimensional array

  useEffect(() => {
    setInterval(() => {
      var value = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
      dataPointID += 1;
      // console.log("md", museDataGlobal);

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

    }, refreshRate);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <a href="https://neuralberta.tech" target="_blank" rel="noopener noreferrer">
          <img src={logo} className="App-logo" alt="logo" />
        </a>
      </header>

      <div className="App-body">



        {/* {museData.map((md,index)=>{
          return <LineChart chartData={md} chartColor={chartColors[index]} />
        })} */}

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

        {/* This will be the modal */}
        {/* <button onClick={connect}>connect</button> */}


      </div>
    </div>
  );
}

export default App;