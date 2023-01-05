import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const options = {
  maintainAspectRatio : false,

  plugins: {
    legend: {
      display: false
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
  animation: {
    duration: 0
  },
};


function LineChart(args) {
  // console.log("dt:", args) // museData, color

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
  return <Line data={chartData} options={options}/>;
}

export default LineChart;
