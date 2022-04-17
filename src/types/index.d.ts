export {};

declare global {
  interface Window {
    arduino: any;
    runner: any;
  }

  interface HTMLElement {
    value: any;
  }

}