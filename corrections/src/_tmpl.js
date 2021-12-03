import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';

const audioContext = new AudioContext();

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

}());

// GUI
function renderGUI() {
  const $main = document.querySelector('.main');
  render(html`

  `, $main);
}

