import '@wokwi/elements';
import { LEDElement, SSD1306Element, PushbuttonElement, PotentiometerElement, SlidePotentiometerElement } from '@wokwi/elements';
import { CPU, PinState } from 'avr8js';
import { connect } from './simulation/ide-connect';
import { CPUPerformance } from './simulation/cpu-performance';
import { formatTime } from './simulation/format-time';

import { ArduinoUno } from '../devices/arduino/ArduinoUno';
import { AVRRunner } from '../devices/arduino/ATmega328Runner';

import { SSD1306Controller } from '../devices/display/ssd1306';
import { DigitalPinComponent, PinDir } from '../devices/DigitalPinComponent';
import { AnalogInputComponent } from '../devices/AnalogInputComponent';

import '../index.css';



const boardElements = document.querySelectorAll<HTMLElement>('#board > *');

// Set up toolbar
let arduino = new ArduinoUno();

let breakpointsSources:string[] = [];
let breakpoints:string[] = [];

// TODO: mover para camada de actions...

/* eslint-disable @typescript-eslint/no-use-before-define */
const btnConnect = document.querySelector('#btn-connect');
btnConnect.addEventListener('click', connectToIde);

const stopButton = document.querySelector('#btn-stop');
stopButton.addEventListener('click', stopCode);

const pauseButton = document.querySelector('#btn-pause');
pauseButton.addEventListener('click', pauseResume);

const loadSavedButton = document.querySelector('#load-saved');
loadSavedButton.addEventListener('click', loadSavedProgram);

document.getElementById("btn-help").addEventListener('click', function(){
  window.open("https://github.com/OpenDevice/websim-arduino-docs/wiki");
});




const statusLabel = document.querySelector('#status-label');
const serialOutputText = document.getElementById('serial-output-text');

const cpuPerf = new CPUPerformance(arduino.MHZ);

arduino.breakEventCallback = (cpu:CPU) => {
 
  arduino.pause();
  updateRunningState();

  let pcAddr = cpu.pc * 2;

  let addr = "0x"+pcAddr.toString(16);

  let srcIndex = breakpoints.indexOf(addr);

  for (let index = 0; index < breakpointsSources.length; index++) {
    const line = breakpointsSources[index];
    if(index == srcIndex){
      console.error(line);
    }else{
      console.warn(line);
    }
    
  }
 //alert("Sopted");
 //debugger;  
};

arduino.simulationTimeCallback = ((cpu) => {
  const time = formatTime(cpu.cycles / arduino.MHZ);
  const speed = (cpuPerf.update(cpu) * 100).toFixed(0);
  // const cycles = cpu.SP; //  [c:${cycles}]
  statusLabel.textContent = `T: ${time} - CPU: ${speed}%`;


});

arduino.serialOutputCallback  = ((text) => {
  serialOutputText.textContent += text;
  serialOutputText.scrollTop = serialOutputText.scrollHeight;
});



// //Disable default IE help popup
// window.onhelp = function() {
//   return false;
// };

// TODO: move to another location...
document.addEventListener("keydown", function(evt) {
    switch (evt.keyCode) {
      //ESC
      case 27:
          stopCode();
          return true;   
      //F2
      case 113:
        loadSavedProgram();
        return true;   
      //Fallback to default browser behaviour
      default:
          return true;
  }
  //Returning false overrides default browser event
  return false;    
});


/**
 * Init drivers for componentes added to div.board 
 */
function initComponents(){
  
  boardElements.forEach((ui) => {

    if(ui instanceof SSD1306Element){
      arduino.addComponent(new SSD1306Controller(ui));
    }

    if(ui instanceof LEDElement){
      arduino.addComponent(new DigitalPinComponent(+ui.dataset.pin, PinDir.OUTPUT,  ui));
    }

    if(ui instanceof PushbuttonElement){
      arduino.addComponent(new DigitalPinComponent(+ui.dataset.pin, PinDir.INPUT,  ui));
    }

    if(ui instanceof PotentiometerElement){
      arduino.addComponent(new AnalogInputComponent(+ui.dataset.pin,  ui));
    } 

    if(ui instanceof SlidePotentiometerElement){
      arduino.addComponent(new AnalogInputComponent(+ui.dataset.pin,  ui));
    }

  });

}

function beforeExecute(runner: AVRRunner){

  window.runner = runner;
  window.arduino = arduino;

  // runner.setBreakpoints(["0x356","0x356","0x35e","0x36a","0x372","0x37e","0x380","0x380","0x388"]);
  

  /*
  breakpoints = [
      "0x356",
      "0x356",
      "0x35e",
      "0x36a",
      "0x372",
      "0x37e",
      "0x380",
      "0x380",
      "0x388"
  ];

  runner.setBreakpoints(breakpoints);

  breakpointsSources = [
    "void loop() {",
    "  digitalWrite(LED_BUILTIN, HIGH);   ",
    "  delay(500);                      ",
    "  digitalWrite(LED_BUILTIN, LOW);    ",
    "  delay(500);                      ",
    "}",
    "void setup() {",
    "  pinMode(LED_BUILTIN, OUTPUT);",
    "}"
 ];

 */

  // runner.portD.addListener((value: number, oldValue: number)=>{
  //   console.log("## port changed %d > %d !!", oldValue, value);
  //   for (let pin = 0; pin < 8; pin++) {
    
  //     console.log("%d = %s", pin, PinState[runner.portD.pinState(pin)]);
  //     if (runner.portD.pinState(pin) === PinState.InputPullUp) {
  //       console.log("---> set HIGH");
  //       runner.portD.setPin(pin, true);
  //        // Now, if the button is pressed call port.setPin(pin, false);
  //        // Otherwise call port.setPin(pin, true);
  //     }
  //   }
  // });

  // runner.cpu.addClockEvent(()=>{

    //   var data = runner.cpu.data
    //   console.log("Sreg", data);
    //   debugger;

    // }, 1000);

}

function executeProgram(hex: string) {

  serialOutputText.textContent = "";

  let runner:AVRRunner = arduino.executeProgram(hex, beforeExecute);

  
 
  // Hook to PORTB register
//  runner.portB.addListener(() => {
//    led12.value = runner.portB.pinState(4) === PinState.High;
//    led13.value = runner.portB.pinState(5) === PinState.High;
//  });


  stopButton.removeAttribute('disabled');
  pauseButton.removeAttribute('disabled');
}

async function saveProgram(hex: string){
  localStorage.setItem("lastProgram", hex);
}

function loadSavedProgram(){
  let hex = localStorage.getItem("lastProgram");
  executeProgram(hex);
}

async function connectToIde() {

  serialOutputText.textContent = '';

  try {

    connect(function(hex:string){ // on upload ...

      executeProgram(hex);

      if (!document.hidden) {
        alert("Upload ok !"); // force focus on window...
      }
      
      saveProgram(hex); // save last program

    }, /** onMessage */ (msg:any) =>{

      onMessageReceived(msg);

    });

  } catch (err) {
    btnConnect.removeAttribute('disabled');
    alert('Failed: ' + err);
  } finally {
    // statusLabel.textContent = '';
  }
}


function onMessageReceived(msg:any){

  btnConnect.setAttribute('disabled', '1');
  btnConnect.firstElementChild.classList.remove('fa-link-slash'); // set as connected
  // btnConnect.firstElementChild.classList.add('fa-link-slash'); // set as connected

  if(msg["breakpoints"]){
    arduino.setBreakpoints(msg["breakpoints"]);
    breakpoints = msg["breakpoints"];
    breakpointsSources = msg["sources"];

    console.log("breakpoints", msg["breakpoints"]);
    console.log("sources", msg["sources"]);
  }

}


function updateRunningState(){
  let icon = pauseButton.firstElementChild;
  if(arduino.isRunning()){
    icon.classList.remove("fa-circle-play");
    icon.classList.add("fa-circle-pause");
  }else{
    icon.classList.remove("fa-circle-pause");
    icon.classList.add("fa-circle-play");  
  }
}

function pauseResume(){

  let icon = pauseButton.firstElementChild;
  if(arduino.isRunning()){
    arduino.pause();
    updateRunningState();
  }else{
    arduino.resume();
    updateRunningState();
  }

}

function stopCode() {
  arduino.stop(); // TODO reset !
  stopButton.setAttribute('disabled', '1');
}



initComponents();

setTimeout(connectToIde, 1000);