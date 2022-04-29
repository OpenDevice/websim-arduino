import { ArduinoUno } from '../../devices/arduino/ArduinoUno';
import { AVRRunner } from '../../devices/arduino/ATmega328Runner';
import { connect } from './ide-connect';
import { CPUPerformance } from './cpu-performance';
import { formatTime } from './format-time';
import { CPU, PinState } from 'avr8js';

export class SimulationController{

  private breakpointsSources:string[] = [];
  private breakpoints:string[] = [];

  public beforeExecute : (runner: AVRRunner) => void; // Callback.

  constructor(arduino:ArduinoUno){

    const _this = this;

    const statusLabel = document.querySelector('#status-label');
    const serialOutputText = document.getElementById('serial-output-text');

    /* eslint-disable @typescript-eslint/no-use-before-define */
    const btnConnect = document.querySelector('#btn-connect');
    btnConnect.addEventListener('click', connectToIde);

    const stopButton = document.querySelector('#btn-stop');
    stopButton.addEventListener('click', stopCode);

    const pauseButton = document.querySelector('#btn-pause');
    pauseButton.addEventListener('click', pauseResume);

    const loadSavedButton = document.querySelector('#load-saved');
    loadSavedButton.addEventListener('click', loadSavedProgram);

    document.getElementById("btn-help").addEventListener('click', function(){
      window.open("https://github.com/OpenDevice/websim-arduino-docs/wiki");
    });

    document.getElementById("buy").addEventListener('click', function(){
      if(window.gtag){ // google analitcs
        window.gtag('event', 'purchase');
      }
      window.open("https://github.com/OpenDevice/websim-arduino-docs/wiki/Buy---Build");
    });

    const cpuPerf = new CPUPerformance(arduino.MHZ);

    arduino.simulationTimeCallback = ((cpu) => {
        const time = formatTime(cpu.cycles / arduino.MHZ);
        const speed = (cpuPerf.update(cpu) * 100).toFixed(0);
        //const cycles = cpu.cycles; //  [c:${cycles}]
        
        statusLabel.textContent = `T: ${time} - CPU: ${speed}%`;
      
      
      });
      
      arduino.serialOutputCallback  = ((text) => {
        serialOutputText.textContent += text;
        serialOutputText.scrollTop = serialOutputText.scrollHeight;
      });


      arduino.breakEventCallback = (cpu:CPU) => {

        arduino.pause();
        updateRunningState();
      
        let pcAddr = cpu.pc * 2;
      
        let addr = "0x"+pcAddr.toString(16);
      
        let srcIndex = this.breakpoints.indexOf(addr);
      
        for (let index = 0; index < this.breakpointsSources.length; index++) {
          const line = this.breakpointsSources[index];
          if(index == srcIndex){
            console.error(line);
          }else{
            console.warn(line);
          }
          
        }
        //alert("Sopted");
        //debugger;  
      };
      
    
      // TODO: move to another location...
    document.addEventListener("keydown", function(evt) {
        switch (evt.keyCode) {
          //ESC
          case 27:
              stopCode();
              return true;   
          //F2
          case 113:
            loadSavedProgram();
            return true;   
          //Fallback to default browser behaviour
          default:
              return true;
      }
      //Returning false overrides default browser event
      return false;    
    });
    
    function executeProgram(hex: string) {
    
        serialOutputText.textContent = "";
      
        let runner:AVRRunner = arduino.executeProgram(hex, _this.beforeExecute);
        
        // Hook to PORTB register
      //  runner.portB.addListener(() => {
      //    led12.value = runner.portB.pinState(4) === PinState.High;
      //    led13.value = runner.portB.pinState(5) === PinState.High;
      //  });
      
      
        stopButton.removeAttribute('disabled');
        pauseButton.removeAttribute('disabled');
      }
      
      async function saveProgram(hex: string){
        localStorage.setItem("lastProgram", hex);
      }
      
      function loadSavedProgram(){
        let hex = localStorage.getItem("lastProgram");
        executeProgram(hex);
      }
      
      async function connectToIde() {
      
        serialOutputText.textContent = '';
      
        try {
      
          connect(function(hex:string){ // on upload ...
      
            executeProgram(hex);
      
            if (!document.hidden) {
              alert("Upload ok !"); // force focus on window...
            }
            
            saveProgram(hex); // save last program
      
          }, /** onMessage */ (msg:any) =>{
      
            onMessageReceived(msg);
      
          });
      
        } catch (err) {
          btnConnect.removeAttribute('disabled');
          alert('Failed: ' + err);
        } finally {
          // statusLabel.textContent = '';
        }
      }
      
      
      function onMessageReceived(msg:any){
      
        btnConnect.setAttribute('disabled', '1');
        btnConnect.firstElementChild.classList.remove('fa-link-slash'); // set as connected
        // btnConnect.firstElementChild.classList.add('fa-link-slash'); // set as connected
      
        // if(msg["breakpoints"]){
        //   arduino.setBreakpoints(msg["breakpoints"]);
        //   this.breakpoints = msg["breakpoints"];
        //   this.breakpointsSources = msg["sources"];
      
        //   console.log("breakpoints", msg["breakpoints"]);
        //   console.log("sources", msg["sources"]);
        // }
      
      }
      
      
      function updateRunningState(){
        let icon = pauseButton.firstElementChild;
        if(arduino.isRunning()){
          icon.classList.remove("fa-circle-play");
          icon.classList.add("fa-circle-pause");
        }else{
          icon.classList.remove("fa-circle-pause");
          icon.classList.add("fa-circle-play");  
        }
      }
      
      function pauseResume(){
      
        let icon = pauseButton.firstElementChild;
        if(arduino.isRunning()){
          arduino.pause();
          updateRunningState();
        }else{
          arduino.resume();
          updateRunningState();
        }
      
      }
      
      function stopCode() {
        arduino.stop(); // TODO reset !
        stopButton.setAttribute('disabled', '1');
      }
    
      setTimeout(connectToIde, 1000);

  }

  

}




