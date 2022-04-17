import {
  avrInstruction,
  AVRTimer,
  CPU,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRIOPort,
  AVRUSART,
  portBConfig,
  portCConfig,
  portDConfig,
  usart0Config,
  spiConfig,
  twiConfig,
  AVRSPI,
  AVRTWI,
  AVRADC,
  adcConfig

} from 'avr8js';
import { I2CBus } from './internal/i2c-bus';

import { loadHex } from './utils/intelhex';
import { MicroTaskScheduler } from './utils/task-scheduler';

export type CPUEvent = {
  period : number,  //milliseconds
  eventCall : any
}

// ATmega328p params
const FLASH = 0x8000;

// Datasheet: https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf
// Overview: https://www.theengineeringprojects.com/2017/08/introduction-to-atmega328.html
export class AVRRunner {
  readonly program = new Uint16Array(FLASH);
  readonly cpu: CPU;
  readonly timer0: AVRTimer;
  readonly timer1: AVRTimer;
  readonly timer2: AVRTimer;
  readonly portB: AVRIOPort;
  readonly portC: AVRIOPort;
  readonly portD: AVRIOPort;
  readonly usart: AVRUSART;
  readonly spi: AVRSPI;
  readonly twi: AVRTWI;
  readonly i2cBus: I2CBus  | null = null;
  readonly adc: AVRADC;
  readonly MHZ = 16e6; // 16 MHZ
  readonly workUnitCycles = 500000;
  readonly taskScheduler = new MicroTaskScheduler();


  //events
  private cpuEvents : CPUEvent[] = [];
  private cpuEventsMicrosecond : CPUEvent[] = [];


  constructor(hex: string) {
 
    loadHex(hex, new Uint8Array(this.program.buffer));

    this.cpu = new CPU(this.program);

    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);

    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    this.usart = new AVRUSART(this.cpu, usart0Config, this.MHZ);
    this.spi = new AVRSPI(this.cpu, spiConfig, this.MHZ);
    this.twi = new AVRTWI(this.cpu, twiConfig, this.MHZ);
    this.i2cBus = new I2CBus(this.twi);
    this.adc = new AVRADC(this.cpu, adcConfig);

    this.taskScheduler.start();

    // FROM: https://stackblitz.com/edit/avr8js-simon-game-j4rxnx?file=execute.ts
    // Simulate analog port (so that analogRead() eventually return)
    /*
    this.cpu.writeHooks[0x7a] = value => {
      if (value & (1 << 6)) {
        this.cpu.data[0x7a] = value & ~(1 << 6); // clear bit - conversion done
        // random value
        const analogValue = Math.floor(Math.random() * 1024);
        this.cpu.data[0x78] = analogValue & 0xff;
        this.cpu.data[0x79] = (analogValue >> 8) & 0x3;
        return true; // don't update
      }
    };
    */
  }

  private cpuTimeMS = 0;
  private cpuTimeMicroS = 0;

  private isStopped = false;

  // CPU main loop
  execute(callback: (cpu: CPU) => void) {

    if(this.isStopped)
        return;
        
    const cyclesToRun = this.cpu.cycles + this.workUnitCycles;

    while (this.cpu.cycles < cyclesToRun) {
      avrInstruction(this.cpu);
      this.cpu.tick();

      // TODO this probably can be done more efficiently?

      if(this.cpuEvents.length > 0 
         && Math.floor(this.cpu.cycles*1000/this.MHZ) !== this.cpuTimeMS)
      {
          this.cpuTimeMS = Math.floor(this.cpu.cycles*1000/this.MHZ);

          for(const event of this.cpuEvents)
          {

              if(Math.floor(this.cpu.cycles*1000/this.MHZ) % event.period === 0) //events by ms
              {
                  event.eventCall(this.cpu.cycles);

              }
          }
      }

      if(this.cpuEventsMicrosecond.length > 0 
         && Math.floor(this.cpu.cycles*1000000/this.MHZ) !== this.cpuTimeMicroS)
      {
          this.cpuTimeMicroS = Math.floor(this.cpu.cycles*1000000/this.MHZ);


          for(const event of this.cpuEventsMicrosecond)
          {

              if(Math.floor(this.cpu.cycles*1000000/this.MHZ) % event.period === 0)
              {

                  event.eventCall(this.cpu.cycles);

              }
          }
      }

    }

    callback(this.cpu); 
    this.taskScheduler.postTask(() => this.execute(callback));
    // requestAnimationFrame(() => this.execute(callback));
  }

  start(callback: (cpu: CPU) => void){
      this.isStopped = false;

      console.log("[runner] this.cpuEventsMicrosecond:", this.cpuEventsMicrosecond.length);
      console.log("[runner] this.cpuEvents:", this.cpuEvents.length);

      this.execute(callback);
  }

  stop() {
    this.taskScheduler.stop();
    this.isStopped = true;
  }

  /**
   * Request CPUEvent on every X miliseconds
   * @param period in ms
   * @param eventCall callback
   */
  requestUpdate(period: number, eventCall: any) {
    const cpuEvent: CPUEvent = { period: period, eventCall: eventCall };
    this._addCPUEvent(cpuEvent);
  }

  /**
   * Request CPUEvent on every X Microsecond
   * @param period in Microsecond
   * @param eventCall callback
 */
  requestUpdateMicrosecond(period: number, eventCall: any) {
    const cpuEvent: CPUEvent = { period: period, eventCall: eventCall };
    this._addCPUEventMicrosecond(cpuEvent);
  }

  _addCPUEvent(cpuEvent : CPUEvent)
  {
      this.cpuEvents.push(cpuEvent);
  }

  _addCPUEventMicrosecond(cpuEvent : CPUEvent)
  {
      this.cpuEventsMicrosecond.push(cpuEvent);
  }
}
