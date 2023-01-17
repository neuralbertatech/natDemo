/* eslint-disable no-restricted-globals */
import { Chart } from "chart.js/auto";

onmessage = function(event) {
  const {canvas, config} = event.data;
  const chart = new Chart(canvas, config);

  // Resizing the chart must be done manually, since OffscreenCanvas does not include event listeners.
  canvas.width = 100;
  canvas.height = 100;
  chart.resize();
};