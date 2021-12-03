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
    // <-----------------------------
    // code
    // ---------------------------->
  }

  connect(output) {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  // use `setTargetAtTime` automation instead of setting the `value` property
  // to exponentially ramp to the value and avoid clicks and pop.
  set carrierFrequency(value) {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  get carrierFrequency() {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  set modFrequency(value) {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  get modFrequency() {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  set depth(value) {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  get depth() {
    // <-----------------------------
    // code
    // ---------------------------->
  }

  connect(output) {
    // <-----------------------------
    // code
    // ---------------------------->
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

  // implement master volume
  const master = audioContext.createGain();
  master.connect(audioContext.destination);

  // instantiate the synth
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
