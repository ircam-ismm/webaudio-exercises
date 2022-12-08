import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit/html.js';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import { Scheduler } from 'waves-masters';
import { AudioBufferLoader } from 'waves-loaders';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-matrix.js';

const audioContext = new AudioContext();

// Global variable definition
const numSteps = 16;
const bpm = 280;
const score = []; // the beats that should be played
const stepDisplayScore = [new Array(numSteps).fill(0)]; // to follow the current beat
let master = null;
const effects = [];
const $guiContainer = document.querySelector('#main');

class StepSequencer {
  constructor(audioContext, score, bpm, soundfiles, effects) {
    this.audioContext = audioContext;
    this.score = score;
    this.bpm = bpm;
    this.soundfiles = soundfiles;
    this.effects = effects;

    this.stepIndex = 0;
    this.numSteps = this.score[0].length;
  }

  advanceTime(currentTime) {
    // Q3 --------------------------------------------------------->

    // Q4 --------------------------------------------------------->
  }
}

class DisplaySteps {
  constructor(stepDisplayScore, npm, callback) {
    this.stepDisplayScore = stepDisplayScore;
    this.bpm = bpm;
    this.callback = callback;

    this.stepIndex = 0;
    this.numSteps = this.stepDisplayScore[0].length;
  }

  advanceTime(currentTime, _, dt) {
    // be carefull this.stepDisplayScore has only one track
    this.stepDisplayScore[0].fill(0);
    this.stepDisplayScore[0][this.stepIndex] = 1;
    
    // Q5 --------------------------------------------------------->
  }
}

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  const loader = new AudioBufferLoader();

  const soundfiles = [
    await loader.load('./assets/909-BD-low.wav'),
    await loader.load('./assets/909-SD-low.wav'),
    await loader.load('./assets/909-HH-closed.wav'),
    await loader.load('./assets/909-PC-clap.wav'),
    await loader.load('./assets/909-LT-high.wav'),
    await loader.load('./assets/909-MT-low.wav'),
    await loader.load('./assets/909-HT-high.wav'),
  ];

  // Q1 --------------------------------------------------------->

  for (let i = 0; i < soundfiles.length; i++) {
    // populate score as score[track][beat]
    score[i] = new Array(numSteps).fill(0);

    // Q2 --------------------------------------------------------->

    effects[i] = {
      input: gain, // alias gain to input so that the synth doesn't have to know the object names
      gain,
      lowpass,
    };
  }

  const scheduler = new Scheduler(() => audioContext.currentTime);
  const stepSequencer = new StepSequencer(audioContext, score, bpm, soundfiles, effects);

  const startTime = audioContext.currentTime + 0.1;
  scheduler.add(stepSequencer, startTime);

  renderGUI();
}());

function dbToLinear(db) {
  // Q6 --------------------------------------------------------->
}

// GUI
function renderGUI() {
  render(html`
    <div style="margin-bottom: 10px;">
      <sc-text
        readonly
        value="master volume"
        width="120"
      ></sc-text>
      <sc-slider
        min="-80"
        max="6"
        value="0"
        @input="${e => {
          const gain = dbToLinear(e.detail.value);
          master.gain.setTargetAtTime(gain, audioContext.currentTime, 0.01);
        }}"
      ></sc-slider>
    </div>
    <div>
      <sc-matrix
        width="${30 * numSteps}"
        height="${10}"
        .value="${stepDisplayScore}"
        @change="${e => console.log(e.detail.value)}"
      ></sc-matrix>
    </div>
    <div>
      <sc-matrix
        style="float: left"
        width="${30 * numSteps}"
        height="${30 * score.length}"
        .value="${score}"
        @change="${e => console.log(e.detail.value)}"
      ></sc-matrix>
      <div style="float: left">
        ${score.map((track, index) => {
          return html`
            <div>
              <sc-text
                readonly
                value="volume"
                width="160"
              ></sc-text>
              <sc-slider
                min="-80"
                max="6"
                value="0"
                @input="${e => {
                  const gainNode = effects[index].gain;
                  const gain = dbToLinear(e.detail.value);
                  gainNode.gain.setTargetAtTime(gain, audioContext.currentTime, 0.01);
                }}"
              ></sc-slider>
              <sc-text
                readonly
                value="lowpass frequency"
                width="160"
              ></sc-text>
              <sc-slider
                min="50"
                max="18000"
                value="${effects[index].lowpass.frequency.value}"
                @input="${e => {
                  const lowpass = effects[index].lowpass;
                  lowpass.frequency.setTargetAtTime(e.detail.value, audioContext.currentTime, 0.01);
                }}"
              ></sc-slider>
            </div>
          `;
        })}
      </div>
    <div>
  `, $guiContainer);
}

