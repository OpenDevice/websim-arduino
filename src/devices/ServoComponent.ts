import { ServoElement } from '@wokwi/elements';
import { ArduinoUno, map } from './arduino/ArduinoUno';
import { AVRRunner } from './arduino/ATmega328Runner';
import { Component } from './Component';

const MIN_SERVO_PWM = 554;
const MAX_SERVO_PWM = 2400;

/**
 * Ref: https://www.youtube.com/watch?v=1WnGv-DPexc
 */
export class ServoComponent implements Component {
  widthOfLastPulse: number;
  startingCpuCyclesOfPulse: number;
  pinState: boolean;
  arduino: ArduinoUno;

  constructor(private pin: number, private ui: ServoElement) {
    this.reset();
    //this.update = debounce_leading(this, this.update);
  }

  init(arduino: ArduinoUno, runner: AVRRunner): void {
    this.arduino = arduino;

    arduino.onPinChange(this.pin, (pinState) => {
      this.updatePWM(pinState, runner.cpu.cycles);
    });

  }

  getAngle(): number {

    let pwm = this.widthOfLastPulse;
    if(pwm < MIN_SERVO_PWM) pwm = MIN_SERVO_PWM;
    if(pwm > MAX_SERVO_PWM) pwm = MAX_SERVO_PWM;

    return Math.floor(map(pwm, MIN_SERVO_PWM, MAX_SERVO_PWM, 0, 180));
  }

  update(){
    this.ui.angle = this.getAngle();
    // console.log("angle", this.ui.angle);
  }

  updatePWM(pinState: boolean, cpuCycles: number) {
    if (pinState) {
      if (!this.pinState) {
        //if we are LOW
        this.startingCpuCyclesOfPulse = cpuCycles;
      }
    } else {
      if (this.pinState) {
        let pwm =  this.arduino.cyclesToMillis(cpuCycles - this.startingCpuCyclesOfPulse);
        if(this.widthOfLastPulse != pwm){
          this.widthOfLastPulse = pwm;
          this.update();
        }
      }
    }
    this.pinState = pinState;
  }

  reset() {
    this.widthOfLastPulse = MIN_SERVO_PWM;
    this.startingCpuCyclesOfPulse = -1;
    this.pinState = false;
  }
}
