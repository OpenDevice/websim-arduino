import { ArduinoUno } from "./arduino/ArduinoUno";
import { AVRRunner } from "./arduino/ATmega328Runner";
import { Component } from "./Component";
import { PinState } from 'avr8js';

const TAG = "[analog]";

export class AnalogInputComponent implements Component {

  private arduino:ArduinoUno;

  constructor(private pin: number,  private ui: HTMLElement){

    this.ui.addEventListener('input', () => {
        let value = this.map(ui.value, 0, 100, 0, 5);
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

  map(x:number, in_min:number, in_max:number, out_min:number, out_max:number) : number {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  


}