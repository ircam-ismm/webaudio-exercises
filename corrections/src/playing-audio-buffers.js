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
  // // @students step 1 -------------------
  // // -> simply play the buffers
  // const buffer = data.buffers[filename];

  // const src = audioContext.createBufferSource();
  // src.connect(audioContext.destination);
  // src.buffer = buffer;

  // src.start();
  // // -----------------------------

  // @students step 2 -------------------
  // -> adding volume
  const buffer = model.buffers[filename];
  const volume = model.volume;
  const env = audioContext.createGain();
  env.connect(audioContext.destination);
  env.gain.value = volume;

  const src = audioContext.createBufferSource();
  src.connect(env);
  src.buffer = buffer;

  src.start();
  // -----------------------------

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

  // @students -------------------
  // 1. load sound files
  const loader = new AudioBufferLoader();
  const buffers = await loader.load(soundfiles);

  // @present - anatomy of an AudioBuffer (important for the project)
  // const buffer = buffers[0]; // pick first buffer
  // console.log(buffer.sampleRate);
  // console.log(buffer.getChannelData(0)); // check underlying data

  // 2. use the result and the `soundfile` Array to populate data.buffers
  // data.buffers -> Object{ [filename]: AudioBuffer }
  soundfiles.forEach((pathname, index) => {
    const filename = pathname.split('/')[2];
    model.buffers[filename] = buffers[index];
  });

  // -----------------------------

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
