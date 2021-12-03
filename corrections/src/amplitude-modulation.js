import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import '@ircam/simple-components/sc-button.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-text.js';

const audioContext = new AudioContext();

const globals = { master: null, amSynth: null };

// [students] ----------------------------

class AMSynth {
  constructor(audioContext) {
    this.audioContext = audioContext;

    this._depthValue = 1; // this value will control both tremolo and depth nodes

    this._tremolo = audioContext.createGain(); // the gain that will be modulated [0, 1]
    this._tremolo.gain.value = 1 - this._depthValue / 2;

    // scale mod oscillator to make sure `depth + tremolo` stays in the [0, 1] range
    // `depth` should stay between [0, 0.5] -> therefore producing a sine [-0.5, 5]
    // `tremolo` should be complementary between [1, 0.5]
    this._depth = audioContext.createGain();
    this._depth.gain.value = this._depthValue / 2;
    this._depth.connect(this._tremolo.gain);

    this._mod = audioContext.createOscillator();
    this._mod.frequency.value = 2;
    this._mod.connect(this._depth); //

    this._carrier = audioContext.createOscillator();
    this._carrier.connect(this._tremolo);

    this._mod.start();
    this._carrier.start();

    // _tremolo is the output of the synth
    this._output = this._tremolo
  }

  connect(output) {
    this._carrier.connect(output);
  }

  // use `setTargetAtTime` automation instead of setting the `value` property
  // to exponentially ramp to the value and avoid clicks and pop.
  set carrierFrequency(value) {
    const startTime = this.audioContext.currentTime;
    const timeConstant = 0.001;
    this._carrier.frequency.setTargetAtTime(value, startTime, timeConstant);
  }

  get carrierFrequency() {
    return this._carrier.frequency.value;
  }

  set modFrequency(value) {
    const startTime = this.audioContext.currentTime;
    const timeConstant = 0.001;
    this._mod.frequency.setTargetAtTime(value, startTime, timeConstant);
  }

  get modFrequency() {
    return this._mod.frequency.value;
  }

  set depth(value) {
    this._depthValue = value;
    const startTime = this.audioContext.currentTime;
    const timeConstant = 0.001;

    this._tremolo.gain.setTargetAtTime(1 - this._depthValue / 2, startTime, timeConstant);
    this._depth.gain.setTargetAtTime(this._depthValue / 2, startTime, timeConstant)
  }

  get depth() {
    return this._depthValue;
  }

  connect(output) {
    this._output.connect(output);
  }
}

// ## Going further
// - implement start/stop methods
//   @warning: AudioSources can only be used once, when `stop` is called `start`
//   cannot be called again, a new node must be created
//   cf. https://webaudio.github.io/web-audio-api/#AudioScheduledSourceNode
// - derive to create a Tremolo effect on arbitrary sources
// - duplicate to have several synths in parallel, each with their own volume control
// - use the same ideas to implement a FM synthesis

// ![students] ----------------------------

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // [students] ----------------------------
  // implement master volume
  const master = audioContext.createGain();
  master.connect(audioContext.destination);

  // ![students] ----------------------------

  const amSynth = new AMSynth(audioContext);
  amSynth.connect(master);

  // make the components globals
  globals.master = master;
  globals.amSynth = amSynth;

  renderGUI();
}());

// GUI
function renderGUI() {
  const $main = document.querySelector('.main');
  render(html`
    <div style="padding-bottom: 16px">
      <sc-text
        value="master"
        readonly
      ></sc-text>
      <sc-slider
        min="0"
        max="1"
        value="${globals.master.gain.value}"
        @input="${e => globals.master.gain.value = e.detail.value}"
      ></sc-slider>
    </div>

    <div style="padding: 10px; border: 1px solid #565656">
      <h3>AM Synth</h3>
      <div style="padding-bottom: 4px">
        <sc-text
          value="carrier"
          readonly
        ></sc-text>
        <sc-slider
          min="0"
          max="1000"
          width="300"
          display-number
          value="${globals.amSynth.carrierFrequency}"
          @input="${e => globals.amSynth.carrierFrequency = e.detail.value}"
        ></sc-slider>
      </div>
      <div style="padding-bottom: 4px">
        <sc-text
          value="mod"
          readonly
        ></sc-text>
        <sc-slider
          min="0"
          max="1000"
          width="300"
          display-number
          value="${globals.amSynth.modFrequency}"
          @input="${e => globals.amSynth.modFrequency = e.detail.value}"
        ></sc-slider>
      </div>
      <div style="padding-bottom: 4px">
        <sc-text
          value="depth"
          readonly
        ></sc-text>
        <sc-slider
          min="0"
          max="1"
          width="300"
          display-number
          value="${globals.amSynth.depth}"
          @input="${e => globals.amSynth.depth = e.detail.value}"
        ></sc-slider>
      </div>
    </div>
  `, $main);
}
