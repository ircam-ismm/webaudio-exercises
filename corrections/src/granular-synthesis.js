import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import { Scheduler } from 'waves-masters';
import { AudioBufferLoader } from 'waves-loaders';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-button.js';

const audioContext = new AudioContext();

const globals = {
  buffer: null,
  synth: null,
  scheduler: null,
}

// [students] ----------------------------------------
class GranularEngine {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.period = 0.05; // period of the grains
    this.duration = 0.2; // duration of the grains
    this._position = 0; // position in the buffer

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

  set position(value) {
    // clamp to [0, buffer.duration - grain.duration]
    this._position = Math.max(0, Math.min(this.buffer.duration - this.duration, value));
  }

  get position() {
    return this._position;
  }

  advanceTime(currentTime, audioTime, dt) {
    // add some jitter to avoid audible artifact due to period
    const grainTime = audioTime + Math.random() * 0.005;

    // fire and forget the grain
    const env = this.audioContext.createGain();
    env.gain.value = 0;
    env.connect(this.output);

    const src = this.audioContext.createBufferSource();
    src.buffer = this.buffer;
    src.connect(env);

    // triangle ramp
    env.gain.setValueAtTime(0., grainTime);
    env.gain.linearRampToValueAtTime(1., grainTime + this.duration / 2);
    env.gain.linearRampToValueAtTime(0., grainTime + this.duration);

    src.start(grainTime, this.position);
    src.stop(grainTime + this.duration);

    return currentTime + this.period;
  }
}

// ## Going further
// - explore https://webaudio.github.io/web-audio-api/#audiobuffersourcenode to
//   see which controls could be added the granular synth
// - implement some logic to be able to select between several sound files
// - see project :)

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // [students] ----------------------------------------
  // load audio file
  const loader = new AudioBufferLoader();
  const buffer = await loader.load('./assets/cherokee.wav');
  console.log(buffer);

  // create scheduler
  const getTimeFunction = () => audioContext.currentTime;
  const scheduler = new Scheduler(getTimeFunction);

  // create granular engine
  const synth = new GranularEngine(audioContext);
  synth.buffer = buffer;
  synth.connect(audioContext.destination);

  synth.position = 1;
  console.log(buffer.duration, synth.position);

  scheduler.add(synth); // start granular engine
  // ![students] ----------------------------------------

  globals.buffer = buffer;
  globals.scheduler = scheduler;
  globals.synth = synth;
  // @see interface to see to interact w/ the synth and the scheduler
  renderGUI();
}());

// GUI
function renderGUI() {
  const $main = document.querySelector('.main');
  render(html`
    <div style="padding-bottom: 4px;">
      <sc-button
        value="start"
        @input="${e => globals.scheduler.add(globals.synth)}"
      ></sc-button>
      <sc-button
        value="stop"
        @input="${e => globals.scheduler.remove(globals.synth)}"
      ></sc-button>
    </div>
    <div style="padding-bottom: 4px;">
      <sc-text
        value="position"
        readonly
      ></sc-text>
      <sc-slider
        value="${globals.synth.position}"
        min="0"
        max="${globals.buffer.duration}"
        width="500"
        display-number
        @input="${e => globals.synth.position = e.detail.value}"
      ></sc-slider>
    </div>
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
  `, $main);
}

