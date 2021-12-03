import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import { AudioBufferLoader } from 'waves-loaders';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-text.js';

// console.log(basename);
const audioContext = new AudioContext();

const soundfiles = [
  './assets/kick.wav',
  './assets/snare.wav',
  './assets/clap.wav',
  './assets/hh.wav',
  './assets/rimshot.wav',
];

const model = {
  buffers: {},
  volume: 1,
};

function playSound(filename) {
  // -> play the buffer
  // -> add volume
  // <-----------------------------
  // code
  // ---------------------------->

  // ## Going further: separate volume for each buffer
  //
  // 1. modify underlying model, e.g.:
  // ```js
  // model = {
  //   [filename]: {
  //     buffer: <AudioBuffer>,
  //     volume: f64,
  //   },
  //   // ...
  // }
  // ```
  // 2. update GUI and interaction callbacks
  // 3. update `playSound` function
}


(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // 1. load sound files
  // <-----------------------------
  // code
  // ---------------------------->

  // 2. use the result and the `soundfile` Array to populate model.buffers
  // model.buffers -> Object{ [filename]: AudioBuffer }
  // <-----------------------------
  // code
  // ---------------------------->

  renderGUI();
}());


// GUI
function renderGUI() {
  const $main = document.querySelector('.main');

  render(html`
    <div style="padding-bottom: 10px">
      <sc-text
        value="volume"
        readonly
      ></sc-text>
      <sc-slider
        min="0"
        max="1"
        value="${model.volume}"
        @input=${e => model.volume = e.detail.value}
      ></sc-slider>
    </div>
    ${Object.keys(model.buffers).map(filename => {
      return html`
        <sc-button
          style="display: block; padding-bottom: 4px"
          value="${filename}"
          @input="${e => playSound(filename)}"
        ></sc-button>
      `
    })}
  `, $main);
}
