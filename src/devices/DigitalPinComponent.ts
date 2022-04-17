import { ArduinoUno } from "./arduino/ArduinoUno";
import { AVRRunner } from "./arduino/ATmega328Runner";
import { Component } from "./Component";
import { PinState } from 'avr8js';
import { LEDElement } from '@wokwi/elements';

export enum PinDir{
  INPUT, OUTPUT
}

const TAG = "[digital]";

export class DigitalPinComponent implements Component {
  
  private arduino:ArduinoUno;

  constructor(private pin: number, private dir: PinDir,  private ui: HTMLElement){

    // Add UI listeners on constructor (not in init())
    if(this.dir == PinDir.INPUT){

        // Set up press push buttons
        // By default buttons will use interved logic set LOW on Press ...
        
        let pressed = (ui.dataset.inverted ? false : true);
        let released = (ui.dataset.inverted ? true : false);

        this.ui.addEventListener('button-press', () => {
          console.log("[digital] [btn-pressed] set %d = ", this.ui.dataset.pin, pressed);
          this.digitalWrite(this.pin, pressed);
        });

        // Set up release push buttons
        this.ui.addEventListener('button-release', () => {
          console.log("[digital] [btn-released] set: %d = ", this.ui.dataset.pin, released);
          this.digitalWrite(this.pin, released);
        });

        // Keyboard alias
        if(ui.dataset.keyboard){

          var self = this;

          document.addEventListener("keydown", function(e) {
            if(e.key == ui.dataset.keyboard) {
              console.log(TAG + "keydown : ", ui);
              self.digitalWrite(self.pin, pressed);
            }
          });

          document.addEventListener("keyup", function(e) {
            if(e.key == ui.dataset.keyboard) {
              console.log(TAG + "keyup : ", ui);
              self.digitalWrite(self.pin, released);
            }
          });
        };

    }
      
  }

  init(arduino: ArduinoUno, runner: AVRRunner): void {

    this.arduino = arduino;

    if(this.dir == PinDir.INPUT){


      // BUGFIX: Simulate the PULLUP resistor
      // See: https://github.com/wokwi/avr8js/issues/123
      if(this.ui.dataset.inverted || typeof(this.ui.dataset.inverted) == "undefined"){
        this.arduino.digitalWrite(this.pin, true);
        // Execute this: runner.portD.setPin(pinIndex, true); 

      }
    }


    if(this.dir == PinDir.OUTPUT){

      if(this.ui instanceof LEDElement){

        let led:LEDElement = this.ui;

        // TODO: create digitalRead on arduinoUno class ....

        let portX = arduino.digitalPinToPort(this.pin);
        let bitMask = arduino.digitalPinToBitMask(this.pin);

        portX.addListener(() => {
          led.value = portX.pinState(bitMask) === PinState.High;
        });

      }

    }
    
  }

  digitalWrite(pin:number, value:boolean){
    if(this.arduino) this.arduino.digitalWrite(pin, value);
  }

  reset(): void {
    throw new Error("Method not implemented.");
  }

 


}