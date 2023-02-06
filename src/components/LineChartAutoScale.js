import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const options = {
  maintainAspectRatio: false,
  animation: false,

  plugins: {
    legend: {
      display: false
    },
    decimation: {
      enabled: true
    }
  },

  tooltips: {
      callbacks: {
        label: function(tooltipItem) {
          return tooltipItem.yLabel;
        }
      }
  },

  // title: {
  //   display: true,
  //   text: "Chart Title"
  // },

  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    }
  },
  // animation: {
  //   duration: 0
  // },
}; 


function LineChartAutoScale(args) {
  const museData = args.chartData || [];
  const color = args.chartColor || '#7967e1';

  var chartData = {
    // labels: museData.chartData.map((data) => data.id),
    labels: museData.map((label) => label.id),
    datasets: [
      {
        label: "Electrode",
        // data: museData.chartData.map((data) => data.e1),
        data: museData.map((data) => data.e1),
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        cubicInterpolationMode: 'monotone',
      },
    ],
  }

  // const canvas = new HTMLCanvasElement();
  // const offscreenCanvas = canvas.transferControlToOffscreen();

  // const worker = new Worker(new URL("chartWorker.js", import.meta.url));
  // worker.postMessage({canvas: offscreenCanvas, options}, [offscreenCanvas]);

  return <Line data={chartData} options={options}/>;
  // return canvas;
}

export default LineChartAutoScale;
