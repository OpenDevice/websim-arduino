import { ArduinoUno, map } from "./arduino/ArduinoUno";
import { AVRRunner } from "./arduino/ATmega328Runner";
import { Component } from "./Component";
import { PinState } from 'avr8js';

const TAG = "[analog]";

export class AnalogInputComponent implements Component {

  private arduino:ArduinoUno;

  constructor(private pin: number,  private ui: HTMLElement){

    this.ui.addEventListener('input', () => {
        let value = map(ui.value, 0, 100, 0, 5);
        console.log(TAG +  "set %d = ", pin, value);
        this.analogWrite(pin, value);
    });
      
  }

  init(arduino: ArduinoUno, runner: AVRRunner): void {
    this.arduino = arduino;
  }

  analogWrite(pin:number, value:number){
    if(this.arduino) this.arduino.analogWrite(pin, value);
  }

  

  reset(): void {
    // throw new Error("Method not implemented.");
  }

 
  


}