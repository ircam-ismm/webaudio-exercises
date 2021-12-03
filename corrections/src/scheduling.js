import "core-js/stable";
import "regenerator-runtime/runtime";
import { html, render } from 'lit-html';
import { resumeAudioContext } from '@ircam/resume-audio-context';
import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-number.js';
import '@ircam/simple-components/sc-bang.js';

const audioContext = new AudioContext();

// a priority queue is a list where each element has a "priority" associated
// with it and, that garantees that the order of the elements is binded
// to this priority. (cf. https://en.wikipedia.org/wiki/Priority_queue)
class DumbPriorityQueue {
  constructor() {
    this.engines = [];
  }

  add(engine, time) {
    engine.time = time;
    this.engines.push(engine);
  }

  head() {
    this.engines.sort((a, b) => a.__time <= b.__time ? -1 : 1);

    if (this.engines.length) {
      const engine = this.engines[0];
      return engine;
    } else {
      return null;
    }
  }

  deleteHead() {
    this.engines.shift();
  }
}

// [students] ----------------------------
const period = 0.05; // seconds
const lookahead = 0.1; // seconds
const queue = new DumbPriorityQueue();

function tick() {
  const now = audioContext.currentTime;
  let engine = queue.head();

  // if the scheduled time of the event is in the time frame defined by the lookahead
  while (engine && engine.time < now + lookahead) {
    // the event will be processed, so we can delete it from the queue
    queue.deleteHead();
    // call the `advanceTime` method of the engine
    const time = engine.time;
    const dt = time - now; // delta time between the actual call of the engine and current time
    const nextTime = engine.advanceTime(time, dt);
    // if the engine retrieve a time at which it wants to be scheduled next, we add it to the queue
    if (nextTime) {
      queue.add(engine, nextTime);
    }
    // get next event in the queue (this may be the event we just added)
    // and jump to the beginning of the while loop
    engine = queue.head();
  }

  // call back `tick` in period
  setTimeout(tick, period * 1000);
}

const metro = {
  guiElement: null, // GUI elements to display the event
  period: 1, // in sec
  advanceTime(currentTime, dt) {
    // [students] ----------------------------

    // lazily look for the gui element
    if (!this.guiElement) {
      this.guiElement = document.querySelector('.metro');
    }

    if (this.guiElement) {
      // delay the activation of the GUI element by dt
      setTimeout(() => {
        this.guiElement.active = true;
      }, dt * 1000);
    }

    // play some metro sound
    const env = audioContext.createGain();
    env.connect(audioContext.destination);
    // create a really simple enveloppe (A[DS]R)
    env.gain.setValueAtTime(0, currentTime); // create a point in automation timeline
    env.gain.linearRampToValueAtTime(1, currentTime + 0.001); // linear attack 10ms
    env.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.05); // exp release 1sec

    const osc = audioContext.createOscillator();
    osc.connect(env);
    osc.frequency.value = 600;

    osc.start(currentTime);
    osc.stop(currentTime + 0.05);

    return currentTime + this.period;
  }
};

// ## Going further
// - write a proper `Scheduler` class
// - allow removing engines
// - implement a step sequencer (cf. playing audio buffer)
// - wrap the metronome into a proper class
// - play different sound for 1rst beat in 4/4, etc.

// ![students] -------------------------)

(async function main() {
  // resume audio context
  await resumeAudioContext(audioContext);

  // launch scheduler
  tick();
  // add our metro engine to the queue
  queue.add(metro, Math.ceil(audioContext.currentTime));

  renderGUI();
}());

// GUI
function renderGUI() {
  const $main = document.querySelector('.main');
  render(html`
    <div style="padding-bottom: 4px;">
      <sc-bang class="metro"></sc-bang>
    </div>
    <div>
      <sc-text
        width="100"
        value="period (sec)"
        readonly
      ></sc-text>
      <sc-number
        min="0.001"
        max="3"
        value="${metro.period}"
        @input="${e => metro.period = e.detail.value}"
      ></sc-number>
    </div>
  `, $main);
}

