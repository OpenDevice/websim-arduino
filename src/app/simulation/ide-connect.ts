
var url = "ws://localhost:8887/?from=web";

export function connect(newFirmwareCallback: Function, onMessage: Function) {
  
    if ("WebSocket" in window) {
        
      var ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";

      let hasConnected = false;
      
      ws.onopen = function() {
        // Web Socket is connected, send data using send()
        //ws.send("Message to send");
        //alert("Message is sent...");

        hasConnected = true;

        ws.send('{"from":"web", "message": "im alive"}'); // notify web connection.
      };
      
      ws.onmessage = function (evt) { 
        var received_msg = evt.data;

        if (received_msg instanceof ArrayBuffer) {

          console.log("[ide-connect] receveid bytes", received_msg);

          let hex = new Uint8Array(received_msg);

          let hexStr = Buffer.from(hex).toString();

          newFirmwareCallback(hexStr);

          ws.send('{"from":"web", "message": "received !"}');
            
        } else {
            
          console.log("[ide-connect] " + received_msg);

          if(received_msg[0] == '{'){
            let json = JSON.parse(received_msg);
            onMessage(json);
          }

        }

        
      };
      
      ws.onclose = function(e) { 

        if(hasConnected)
          alert("Connection lost"); 
        else
          alert("Local server is not running !"); 

      };
  } else {
    
      // The browser doesn't support WebSocket
      alert("WebSocket NOT supported by your Browser!");
  }

}
