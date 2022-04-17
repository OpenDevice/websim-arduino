import { ArduinoUno } from './arduino/ArduinoUno';
import { AVRRunner } from './arduino/ATmega328Runner';

/*
    This design of an electronic component/driver is it general.
*/
export interface Component{

    /** Init Component, this is called before simulator start */
    init(arduino: ArduinoUno, runner: AVRRunner) : void;

    reset() : void;
}
