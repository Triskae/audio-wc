import '../../js/webaudio-controls.js'
import keyboard from '../KeyboardJS-master/index.js'

const template = document.createElement('template');

template.innerHTML = `
<style>
    .label {
        display: inline-block;
        width: 6rem;
        text-align: right;
    }
</style>
<head>
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
</head>
<div style="display: flex; flex-direction: column; border-width:2px;
 border-style: solid;
 border-color:black;
 padding: 5px" id="main">
   <video crossorigin width="720" controls preload="auto" id="vid" style="width: 100%">
   </video>
   <div style="display:flex; flex-direction: row; justify-content: center">
      <span class="inline-flex rounded-md shadow-sm">
      <button type="button" id="play"
         class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
      Play / Pause
      </button>
      </span>
      <span class="inline-flex rounded-md shadow-sm">
      <button type="button" id="stop"
         class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
      Stop
      </button>
      </span>
      <span class="inline-flex rounded-md shadow-sm">
      <button type="button" id="plusTen"
         class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
      +10
      </button>
      </span>
      <span class="inline-flex rounded-md shadow-sm">
      <button type="button" id="minusTen"
         class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700">
      -10
      </button>
      </span>
      <span class="inline-flex rounded-md shadow-sm">
         <webaudio-knob id="knob" min="0" max="1" step="0.10" src="../../../img/knob/LittlePhatty.png"></webaudio-knob>
      </span>
   </div>
   <div style="align-self: center" id="panning-div">
   <label class="label">Balance</label>
      <input id="panning" type="range" min="-1" max="1" step="0.1" value="0">
    <output id="panningValue">0</output>
   </div>
   <div style="align-self: center" id="eq-div">
   <div class="controls">
    <label class="label">60Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-60" class="eq-input"/>
  <output id="gain0">0 dB</output>
  </div>
  <div class="controls">
    <label class="label">170Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-170" class="eq-input"/>
<output id="gain1">0 dB</output>
  </div>
  <div class="controls">
    <label class="label">350Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-350" class="eq-input"/>
<output id="gain2">0 dB</output>
  </div>
  <div class="controls">
    <label class="label">1000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-1000" class="eq-input"/>
<output id="gain3">0 dB</output>
  </div>
  <div class="controls">
    <label class="label">3500Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-3500" class="eq-input"/>
<output id="gain4">0 dB</output>
  </div>
  <div class="controls">
    <label class="label">10000Hz</label>
    <input type="range" value="0" step="1" min="-30" max="30" id="eq-10000" class="eq-input"/>
<output id="gain5">0 dB</output>
  </div>
</div>

<canvas id="eq-canvas"></canvas>
</div>`;

export default class MyPlayer extends HTMLElement {

    static get observedAttributes() {
        return ["src", "controls", "loop", "show-panner", "show-eq", "show-visualisation"];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.src = this.getAttribute('src') || false;
        this.controls = this.getAttribute("controls") || false;
        this.showPanner = this.getAttribute("show-panner") || false;
        this.showEq = this.getAttribute("show-eq") || false;
        this.showVis = this.getAttribute("show-visualisation") || false;
        this.loop = this.getAttribute("loop") || false;

        this.basePath = this.getBaseURL();
        this.fixRelativeImagePaths();
        this.freqs = [];
        this.canvas = this.shadowRoot.getElementById("eq-canvas");
        this.playSwitch = true;
    }


    connectedCallback() {
        if (!this.showPanner) {
            this.shadowRoot.getElementById("panning-div").style.display = "none";
        }

        if(!this.showEq) this.shadowRoot.getElementById("eq-div").style.display = "none";
        if (!this.showVis)this.shadowRoot.getElementById("eq-canvas").style.display = "none";

        this.video = this.shadowRoot.getElementById("vid");
        this.video.volume = 0;
        this.video.controls = this.controls;

        this.play = this.shadowRoot.getElementById("play");
        this.play.onclick = (event) => {
            this.playFunc();

        };

        this.stop = this.shadowRoot.getElementById("stop");
        this.stop.onclick = (event) => {
            this.video.currentTime = 0
            this.video.pause()
        };

        this.plusTen = this.shadowRoot.getElementById("plusTen");
        this.plusTen.onclick = (event) => {
            this.video.currentTime += 10
        };

        this.minusTen = this.shadowRoot.getElementById("minusTen");
        this.minusTen.onclick = (event) => {
            this.video.currentTime -= 10
        };

        this.knob = this.shadowRoot.getElementById("knob");

        this.knob.addEventListener("input", (event) => {
            this.video.volume = event.target.value;
        });

        this.panning = this.shadowRoot.getElementById("panning");
        this.panningValue = this.shadowRoot.getElementById("panningValue");

        this.audioCtx = new AudioContext();
        const videoNode = this.audioCtx.createMediaElementSource(this.video);

        this.pannerNode = this.audioCtx.createStereoPanner();

        this.analyserNode = this.audioCtx.createAnalyser();
        this.analyserNode.fftSize = 1024;
        this.bufferLenght = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLenght);

        videoNode.connect(this.pannerNode).connect(this.analyserNode).connect(this.audioCtx.destination);

        this.panning.oninput = (event) => {
            this.pannerNode.pan.value = event.target.value;
            this.panningValue.innerHTML = event.target.value;
        };
        this.video.onplay = () => {
            this.audioCtx.resume();
        };


        this.eq60 = this.shadowRoot.getElementById("eq-60");
        this.eq170 = this.shadowRoot.getElementById("eq-170");
        this.eq350 = this.shadowRoot.getElementById("eq-350");
        this.eq1000 = this.shadowRoot.getElementById("eq-1000");
        this.eq3500 = this.shadowRoot.getElementById("eq-3500");
        this.eq10000 = this.shadowRoot.getElementById("eq-10000");


        [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
            let eq = this.audioCtx.createBiquadFilter();
            eq.frequency.value = freq;
            eq.type = "peaking";
            eq.gain.value = 0;
            this.freqs.push(eq);
        });

        videoNode.connect(this.freqs[0]);
        for (let i = 0; i < this.freqs.length - 1; i++) {
            this.freqs[i].connect(this.freqs[i + 1]);
        }

        this.freqs[this.freqs.length - 1].connect(this.audioCtx.destination);

        this.eq60.oninput = (event) => this.changeGain(event.target.value, 0);
        this.eq170.oninput = (event) => this.changeGain(event.target.value, 1);
        this.eq350.oninput = (event) => this.changeGain(event.target.value, 2);
        this.eq1000.oninput = (event) => this.changeGain(event.target.value, 3);
        this.eq3500.oninput = (event) => this.changeGain(event.target.value, 4);
        this.eq10000.oninput = (event) => this.changeGain(event.target.value, 5);
        this.video.src = this.src;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvasContext = this.canvas.getContext("2d");
        this.animateEq()

        keyboard.bind('right', (e) => {
            this.video.currentTime += 10;
        });

        keyboard.bind('left', (e) => {
            this.video.currentTime -= 10;
        });
        keyboard.bind('space', (e) => {
            this.playFunc();
        });
        keyboard.bind('up', (e) => {
            if (this.video.volume <= 0.90) {
                this.video.volume += 0.10;
                this.knob.value += 0.10;
            }
        });
        keyboard.bind('down', (e) => {
            if (this.video.volume >= 0.10) {
                this.video.volume -= 0.10;
                this.knob.value -= 0.10;
            }
        });
    }

    playFunc() {
        if (this.playSwitch) {
            this.video.play()
            this.playSwitch = false;
        } else {
            this.video.pause()
            this.playSwitch = true;
        }
    }

    disconnectedCallback() {

    }

    animateEq() {
        this.canvasContext.fillStyle = "rgba(255, 255, 255, 1)";
        this.canvasContext.fillRect(0, 0, this.width, this.height);

        this.analyserNode.getByteTimeDomainData(this.dataArray);

        this.canvasContext.lineWidth = 1;
        this.canvasContext.strokeStyle = "#FF0000";

        this.canvasContext.beginPath();
        let sliceWidth = this.width / this.bufferLenght;
        let x = 0;

        for (let i = 0; i < this.bufferLenght; i++) {
            let v = this.dataArray[i] / 255;
            let y = v * this.height;

            if (i === 0) {
                this.canvasContext.moveTo(x, y);
            } else {
                this.canvasContext.lineTo(x, y);
            }

            x += sliceWidth * 2;
        }

        this.canvasContext.lineTo(this.width, this.height);
        this.canvasContext.stroke();
        requestAnimationFrame(() => {
            this.animateEq();
        });
    }

    getBaseURL() {
        const base = new URL(".", import.meta.url);
        return `${base}`;
    };

    changeGain(sliderVal, nbFilter) {
        let value = parseFloat(sliderVal);
        this.freqs[nbFilter].gain.value = value;
        let output = this.shadowRoot.querySelector("#gain" + nbFilter);
        output.value = value + " dB";
    }

    fixRelativeImagePaths() {
        let webaudioControls = this.shadowRoot.querySelectorAll("webaudio-knob, webaudio-slider, webaudio-switch, img");
        webaudioControls.forEach((e) => {
            let currentImagePath = e.getAttribute("src");
            if (currentImagePath !== undefined) {
                let imagePath = e.getAttribute("src");
                e.src = this.basePath + "/" + imagePath;
            }
        });
    }

}

customElements.define('video-player', MyPlayer);
