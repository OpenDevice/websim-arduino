import '@wokwi/elements';
import { LEDElement, SSD1306Element, PushbuttonElement, PotentiometerElement, SlidePotentiometerElement } from '@wokwi/elements';
import { PinState } from 'avr8js';
import { connect } from './simulation/ide-connect';
import { CPUPerformance } from './simulation/cpu-performance';
import { formatTime } from './simulation/format-time';

import { ArduinoUno } from '../devices/arduino/ArduinoUno';
import { AVRRunner } from '../devices/arduino/ATmega328Runner';

import { SSD1306Controller } from '../devices/display/ssd1306';
import { DigitalPinComponent, PinDir } from '../devices/DigitalPinComponent';
import { AnalogInputComponent } from '../devices/AnalogInputComponent';

import '../index.css';

// 
//const led13 = document.querySelector<LEDElement>('wokwi-led[color=green]');
//const led12 = document.querySelector<LEDElement>('wokwi-led[color=red]');
//const display = document.querySelector<SSD1306Element>('wokwi-ssd1306');

const boardElements = document.querySelectorAll<HTMLElement>('#board > *');

// Set up toolbar
let arduino = new ArduinoUno();

/* eslint-disable @typescript-eslint/no-use-before-define */
const runButton = document.querySelector('#run-button');
runButton.addEventListener('click', connectToIde);
const stopButton = document.querySelector('#stop-button');
stopButton.addEventListener('click', stopCode);

const loadSavedButton = document.querySelector('#load-saved');
loadSavedButton.addEventListener('click', loadSavedProgram);


const statusLabel = document.querySelector('#status-label');
const serialOutputText = document.getElementById('serial-output-text');

const cpuPerf = new CPUPerformance(arduino.MHZ);

arduino.simulationTimeCallback = ((cpu) => {
  const time = formatTime(cpu.cycles / arduino.MHZ);
  const speed = (cpuPerf.update(cpu) * 100).toFixed(0);
  // const cycles = cpu.SP; //  [c:${cycles}]
  statusLabel.textContent = `Simulation time: ${time} (${speed}%)`;
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
}

async function saveProgram(hex: string){
  localStorage.setItem("lastProgram", hex);
}

function loadSavedProgram(){
  let hex = localStorage.getItem("lastProgram");
  executeProgram(hex);
}

async function connectToIde() {
  //led12.value = false;
  //led13.value = false;



  runButton.setAttribute('disabled', '1');

  serialOutputText.textContent = '';

  try {
    statusLabel.textContent = 'Compiling...';

    connect(function(hex:string){

      executeProgram(hex);
      
      saveProgram(hex); // save last program

    });

  } catch (err) {
    runButton.removeAttribute('disabled');
    alert('Failed: ' + err);
  } finally {
    statusLabel.textContent = '';
  }
}

function stopCode() {
  stopButton.setAttribute('disabled', '1');
  runButton.removeAttribute('disabled');
  arduino.stopExecute();
}

initComponents();

setTimeout(connectToIde, 1000);