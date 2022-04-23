import {
  LEDElement,
  SSD1306Element,
  PushbuttonElement,
  PotentiometerElement,
  SlidePotentiometerElement,
} from '@wokwi/elements';

import { ArduinoUno } from '../../devices/arduino/ArduinoUno';
import { AVRRunner } from '../../devices/arduino/ATmega328Runner';

import { SSD1306Controller } from '../../devices/display/ssd1306';
import { DigitalPinComponent, PinDir } from '../../devices/DigitalPinComponent';
import { AnalogInputComponent } from '../../devices/AnalogInputComponent';

/**
 * Init drivers for componentes added to div.board
 */
export class BoardController {
  constructor(private arduino: ArduinoUno) {}

  init(boardElements: NodeListOf<HTMLElement>) {
    boardElements.forEach((ui) => {
      if (ui instanceof SSD1306Element) {
        this.arduino.addComponent(new SSD1306Controller(ui));
      }

      if (ui instanceof LEDElement) {
        this.arduino.addComponent(new DigitalPinComponent(+ui.dataset.pin, PinDir.OUTPUT, ui));
      }

      if (ui instanceof PushbuttonElement) {
        this.arduino.addComponent(new DigitalPinComponent(+ui.dataset.pin, PinDir.INPUT, ui));
      }

      if (ui instanceof PotentiometerElement) {
        this.arduino.addComponent(new AnalogInputComponent(+ui.dataset.pin, ui));
      }

      if (ui instanceof SlidePotentiometerElement) {
        this.arduino.addComponent(new AnalogInputComponent(+ui.dataset.pin, ui));
      }
    });
  }
}
