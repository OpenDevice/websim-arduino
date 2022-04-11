
var url = "ws://localhost:8887";

export function connect(callback: Function) {
  
    if ("WebSocket" in window) {
        
      var ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      
      ws.onopen = function() {
        // Web Socket is connected, send data using send()
        //ws.send("Message to send");
        //alert("Message is sent...");
      };
      
      ws.onmessage = function (evt) { 
        var received_msg = evt.data;

        if (received_msg instanceof ArrayBuffer) {

          console.log("[ide-connect] receveid bytes", received_msg);

          let hex = new Uint8Array(received_msg);

          let hexStr = Buffer.from(hex).toString();

          callback(hexStr);
            
        } else {
            console.log("[ide-connect] " + received_msg);
        }

        
      };
      
      ws.onclose = function() { 
        
        // websocket is closed.
        alert("Connection is closed..."); 
      };
  } else {
    
      // The browser doesn't support WebSocket
      alert("WebSocket NOT supported by your Browser!");
  }

}
