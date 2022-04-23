import { AVRRunner, CPUEvent } from "./ATmega328Runner";
import { I2CBus } from "./internal/i2c-bus";
import { portDConfig, portBConfig, CPU, AVRIOPort } from "avr8js";
import { Component } from "../Component";
import { digital_pin_to_bit_mask } from "./internal/pinMapping";

type callback = (n: string) => any;
type simulationCallback = (cpu: CPU) => any;

export class ArduinoUno {
  private runner: AVRRunner | null = null;
  
  private cpuEvents: CPUEvent[] = [];
  private cpuEventsMicrosecond: CPUEvent[] = [];
  private components: Component[] = [];
  
  public serialOutputCallback: callback | null = null;
  public simulationTimeCallback: simulationCallback | null = null;
  public breakEventCallback: (cpu: CPU) => void;

  public MHZ = 16000000;


  addCPUEvent(period: number, eventCall: any) {
    const cpuEvent: CPUEvent = { period: period, eventCall: eventCall };
    this.cpuEvents.push(cpuEvent);
    this.runner?._addCPUEvent(cpuEvent);
  }

  addCPUEventMicrosecond(period: number, eventCall: any) {
    const cpuEvent: CPUEvent = { period: period, eventCall: eventCall };
    this.cpuEventsMicrosecond.push(cpuEvent);
    this.runner?._addCPUEventMicrosecond(cpuEvent);
  }

  cpuNanos():number {
    return Math.round((this.runner.cpu.cycles / this.runner.MHZ) * 1000000000);
  }

  cpuMillis():number {
    return Math.round((this.runner.cpu.cycles / this.runner.MHZ) * 1000);
  }

  addComponent(comp:Component){
    
    this.components.push(comp);

  }

  // private updateComponents(
  //   value: number,
  //   startPin: number,
  //   cpuCycles: number
  // ): void {
  //   for (const connection of this.pinConnections) {
  //     const pin = connection.pin;
  //     if (pin >= startPin && pin <= startPin + 8) {
  //       connection.component.update(
  //         value & (1 << (pin - startPin)) ? true : false,
  //         cpuCycles
  //       );
  //     }
  //   }
  // }

  executeProgram(hex: string, callbackBeforeExec: Function) {

    if(this.runner){
      this.runner.stop();
      this.runner = null;
    } 
 
    this.runner = new AVRRunner(hex); 

    if(this.breakEventCallback) this.runner.breakEventCallback = this.breakEventCallback;

    for (const event of this.cpuEventsMicrosecond)
      this.runner._addCPUEventMicrosecond(event);

    for (const event of this.cpuEvents) 
      this.runner._addCPUEvent(event);


    this.runner.usart.onByteTransmit = (value) => {
      if (this.serialOutputCallback)this.serialOutputCallback(String.fromCharCode(value));
      //console.log("[uart-tx]", value);
    };

    if(callbackBeforeExec) callbackBeforeExec(this.runner);

    for (const comp of this.components){
      comp.init(this, this.runner);
    }

    this.runner.start((cpu) => {
      if(this.simulationTimeCallback) this.simulationTimeCallback(cpu);
    });

    return this.runner;
  }

  /**
   * @returns NULL if program (executeProgram) not called
   */
  getI2CBus(){
    return this.runner.i2cBus;
  }

  stop() {
    this.runner?.stop();
    this.runner = null;
  }

  pause() {
    this.runner?.pause();
  }

  resume() {
    this.runner?.resume();
  }

  isRunning(){
    if(!this.runner) return false;
    return this.runner.isRunning();
  }

  digitalPinToPort(pin: number): AVRIOPort {

    if (pin >= 0 && pin < 8) {
      return this.runner.portD;
    } else if (pin <= 13) {
      return this.runner.portB;
    } else { 
      return null;
    }

  }

  digitalPinToBitMask(pin: number): number {
    return digital_pin_to_bit_mask[pin];
  }

  /**
   * Pin to Port Conversion
   */
  digitalWrite(pin: number, pinState: boolean): boolean {

    //let portConfig = portDConfig.PIN;
    let pinIndex = 0;
    let port ;

    if (pin > 0 && pin < 8) {
      //portConfig = portDConfig.PIN;
      pinIndex = pin;
      port = this.runner.portD;
    } else if (pin < 13) {
      //portConfig = portBConfig.PIN;
      port = this.runner.portB;
      pinIndex = pin - 8;
    } else return false;

    if (this.runner) {
      port.setPin(pinIndex, pinState);
      //if (!pinState) this.runner.cpu.data[portConfig] &= ~(1 << pinIndex);
      //else this.runner.cpu.data[portConfig] |= 1 << pinIndex;
      return true;
    }

    return false;
  }

  analogWrite(pin:number, analogValue: number){
      // Write analogValue to ADCH and ADCL
      //this.runner.cpu.data[0x78] = analogValue & 0xff;
      //this.runner.cpu.data[0x79] = (analogValue >> 8) & 0x3;

      this.runner.adc.channelValues[pin] = analogValue;
      //this.runner.adc.channelValues[2] = analogValue;
      //this.runner.adc.completeADCRead(analogValue);
   }

   setBreakpoints(breakpoints:string[]){
      this.runner.setBreakpoints(breakpoints);
   }
}

