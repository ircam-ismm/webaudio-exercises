import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';

import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';

// create an audio context
const audioContext = new AudioContext();


(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // create an oscillator
  const sine = audioContext.createOscillator();
  // pipe it to the destination (i.e. dac)
  sine.connect(audioContext.destination);
  // start the oscillator now
  sine.start();

  // create the GUI
  const $main = document.querySelector('.main');
  render(html`
    <sc-text
      value="frequency"
      readonly
    ></sc-text>
    <sc-slider
      min="100"
      max="1000"
      value="${sine.frequency.value}"
      @input="${e => {
        // ramp to target value in 5ms
        sine.frequency.linearRampToValueAtTime(e.detail.value, audioContext.currentTime + 0.005);
      }}"
    ></sc-slider>
  `, $main);
}());


