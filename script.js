// A global variable to store the JSON string buffer
let jsonBuffer = '';

async function readSerialData(port) {
  const textDecoder = new TextDecoder();
  
  while (port.readable) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // Reader has been canceled
          break;
        }

        // 1. Decode the byte array into a string and append it to the buffer
        const chunk = textDecoder.decode(value);
        jsonBuffer += chunk;
        
        // 2. Process the buffer if it contains a complete message (ends with a newline)
        if (jsonBuffer.includes('\n')) {
          // Split the buffer at the first newline to get the complete message
          const [message, remainingBuffer] = jsonBuffer.split('\n', 2);
          
          try {
            // 3. Parse the JSON string into a JavaScript object
            const jsonData = JSON.parse(message.trim());
            console.log("Received JSON object:", jsonData);

            // Here is where you can use the data. For example:
            // updateUI(jsonData);
            
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          
          // 4. Update the buffer to the remaining part
          jsonBuffer = remainingBuffer;
        }
      }
    } catch (error) {
      console.error('Error reading serial data:', error);
    } finally {
      reader.releaseLock();
    }
  }
}

const connectButton = document.getElementById('Connect');

connectButton.onclick = async () => {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        // Call the dedicated function to handle data reading
        readSerialData(port);

    } catch (error) {
        console.error('Error opening serial port:', error);
    }
}


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
/*
navigator.serial.onconnect = async (event) => {
    console.log('Serial device connected:', event);
    await this.open({ baudRate: 115200 });
    while (this.readable) {
        const reader = this.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                console.log(value);
                if (done) {
                    // |reader| has been canceled.
                    break;
                }
            // Do something with |value|…
            }
        } catch (error) {
            // Handle |error|…
        } finally {
            reader.releaseLock();
        }
    }
}
navigator.serial.ondisconnect = (event) => {
    // Add |event.target| to the UI.
    console.log('Serial device connected:', event);
}*/