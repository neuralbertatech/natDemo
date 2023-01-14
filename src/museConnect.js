import { MuseClient } from 'muse-js';

async function connect() {
  // let client = new MuseClient();
  // await client.connect();
  // await client.start();


  // console.log("short return, pretend we succeeded");
  // dismissModalConnect();
  // return;

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
    // alert("connected");
    dismissModalConnect();

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
    // console.error("Connection error: " + err);
    alert("Connection error: " + err);
  }
}

export default connect;