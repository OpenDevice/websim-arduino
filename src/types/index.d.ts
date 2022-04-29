export {};

declare global {
  interface Window {
    arduino: any;
    runner: any;
    gtag: any;  // google analitcs
  }

  interface HTMLElement {
    value: any;
  }

}