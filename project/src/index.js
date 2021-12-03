import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import { Scheduler } from 'waves-masters';
import { AudioBufferLoader } from 'waves-loaders';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-button.js';
// import '@ircam/simple-components/sc-surface.js';
import '@ircam/simple-components/sc-dot-map.js';

const audioContext = new AudioContext();
// const audioFile = './assets/ligeti-artikulation.wav';
// const audioFile = './assets/drum-loop.wav';
const audioFile = './assets/hendrix.wav';
// const audioFile = './assets/cherokee.wav';

const globals = {
  buffer: null,
  synth: null,
  scheduler: null,
  guiPosition: { x: null, y: null }, // normalized position in the interface
}

const data = {
  times: [],
  rms: [], // list of RMS values for each block
  zeroCrossing: [],
  // we need normalized values for the interface and search
  normX: [], // list of normalized values according to one of the analysis
  normY: [], // list of normalized values according to another analysis
}

const BLOCK_SIZE = 2048;
const HOP_SIZE = 512;

// returns an Array of the blocks start times from the given audio signal
// if the last block is < blockSize, just ignore it
// @param {Float32Array} channelData - PCM data from the AudioBuffer (assume mono)
// @param {Number} sampleRate - sample rate of the given audio data
// @param {Number} blockSize - Size of the block to perform the analysis (in sample)
// @param {Number} hopSize - Size of hop between two consecutive blocks
// @return {Array}
function getTimes(channelData, sampleRate, blockSize, hopSize) {

}

// returns an Array of zero-crossing values from the given audio signal
// if the last block is < blockSize, just ignore it
// @param {Float32Array} channelData - PCM data from the AudioBuffer (assume mono)
// @param {Number} sampleRate - sample rate of the given audio data
// @param {Number} blockSize - Size of the block to perform the analysis (in sample)
// @param {Number} hopSize - Size of hop between two consecutive blocks
// @return {Array}
function rms(channelData, sampleRate, blockSize, hopSize) {

}

// returns an estimation of the pitch / noisiness (in Hz) using zero-crossing
// from the given audio signal
// if the last block is < blockSize, just ignore it
// @param {Float32Array} channelData - PCM data from the AudioBuffer (assume mono)
// @param {Number} sampleRate - sample rate of the given audio data
// @param {Number} blockSize - Size of the block to perform the analysis (in sample)
// @param {Number} hopSize - Size of hop between two consecutive blocks
// @return {Array}
function zeroCrossing(channelData, sampleRate, blockSize, hopSize) {

}

// normalize given `data` array according to its min and max
// @param {Array} data - Array of the data to normalize
// @return {Array}
function normalize(data) {

}

function findStartTimeFromGuiPosition(guiPosition, data) {

}

// [students] ----------------------------------------
class ConcatEngine {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.period = 0.05; // period of the grains
    this.duration = 0.2; // duration of the grains

    this.output = audioContext.createGain();
  }

  connect(output) {
    this.output.connect(output);
  }

  set buffer(value) {
    this._buffer = value;
  }

  get buffer() {
    return this._buffer;
  }

  advanceTime(currentTime, audioTime, dt) {

  }
}

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // [students] ----------------------------------------
  // 1. load audio file

  // 2. perform analysis and store results in `data`

  // 3. compute normalized analysis for GUI and search

  // 4. create scheduler

  // 5. create concat engine

  // 6. add engine to scheduler


  globals.buffer = buffer;
  globals.scheduler = scheduler;
  globals.synth = synth;
  // @see interface to see to interact w/ the synth and the scheduler
  renderGUI();
}());

// GUI
function renderGUI() {
  const $main = document.querySelector('.main');
  const dots = [];
  for (let i = 0; i < data.normX.length; i++) {
    const dot = { x: data.normX[i], y: data.normY[i] }
    dots.push(dot);
  }

  render(html`
    <div style="padding-bottom: 4px;">
      <sc-text
        value="period"
        readonly
      ></sc-text>
      <sc-slider
        value="${globals.synth.period}"
        min="0.01"
        max="0.2"
        width="500"
        display-number
        @input="${e => globals.synth.period = e.detail.value}"
      ></sc-slider>
    </div>
    <div style="padding-bottom: 4px;">
      <sc-text
        value="duration"
        readonly
      ></sc-text>
      <sc-slider
        value="${globals.synth.duration}"
        min="0"
        max="1"
        width="500"
        display-number
        @input="${e => globals.synth.duration = e.detail.value}"
      ></sc-slider>
    </div>
    <!-- insert new sliders there -->

    <div style="position: absolute">
      <sc-dot-map
        style="position: absolute; top: 0; left: 0"
        width="500"
        height="500"
        color="white"
        radius="2"
        y-range="[1, 0]"
        value="${JSON.stringify(dots)}"
      ></sc-dot-map>
      <sc-dot-map
        style="position: absolute; top: 0; left: 0"
        width="500"
        height="500"
        background-color="transparent"
        y-range="[1, 0]"
        capture-events
        @input="${e => {
          if (e.detail.value.length) {
            globals.guiPosition.x = e.detail.value[0].x;
            globals.guiPosition.y = e.detail.value[0].y;
          } else {
            globals.guiPosition.x = null;
            globals.guiPosition.y = null;
          }
        }}"
      ></sc-dot-map>
    </div>
  `, $main);
}

