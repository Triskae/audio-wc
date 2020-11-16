import '../../js/webaudio-controls'

const template = document.createElement('template');

template.innerHTML = `
    <video crossorigin width="720" controls preload="auto" id="vid">
        <source src="../../videos/big_buck_bunny_640_512kb.mp4" type="video/mp4">
    </video>


    <span class="inline-flex rounded-md shadow-sm">
        <button type="button" onclick="play()"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
          Play
        </button>
    </span>
    <span class="inline-flex rounded-md shadow-sm">
        <button type="button" onclick="pause()"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
          Pause
        </button>
    </span>
    <span class="inline-flex rounded-md shadow-sm">
        <button type="button" onclick="stop()"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
          Stop
        </button>
</span>
    <span class="inline-flex rounded-md shadow-sm">
        <button type="button" onclick="plusTen()"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
          +10
        </button>
    </span>
    <span class="inline-flex rounded-md shadow-sm">
        <button type="button" onclick="minusTen()"
                class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
          -10
        </button>
    </span>

    <span class="inline-flex rounded-md shadow-sm">
        <webaudio-knob id="knob-volume" min="0" max="1" step="0.10" src="img/knob/LittlePhatty.png"></webaudio-knob>
    </span>`;

export default class MyPlayer extends HTMLVideoElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        this.src = this.getAttribute('src');
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {

    }

    disconnectedCallback() {

    }

    stop() {
        video.currentTime = 0;
        video.pause();
    }

    play() {
        video.play();
    }

    pause() {
        video.pause();
    }

    plusTen() {
        video.currentTime += 10;
    }

    minusTen() {
        video.currentTime -= 10;
    }
}

customElements.define('video-player', MyPlayer);
