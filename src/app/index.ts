import '@wokwi/elements';

import { CPU, PinState } from 'avr8js';

import { ArduinoUno } from '../devices/arduino/ArduinoUno';
import { AVRRunner } from '../devices/arduino/ATmega328Runner';
import { SimulationController } from './simulation/simulationController';
import { BoardController } from './simulation/boardController';

import '../index.css';

const boardElements = document.querySelectorAll<HTMLElement>('#board > *');


let arduino = new ArduinoUno();

// Init Drivers of Board
let boardController = new BoardController(arduino);
boardController.init(boardElements);

// Set up toolbar actions
let simulationController = new SimulationController(arduino);


simulationController.beforeExecute = (runner: AVRRunner) => {

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