// A global variable to store the JSON string buffer
var spectralSensorJSONData = {
  "SpectralData":[
    {"Color":"Violet","Value":0},
    {"Color":"Blue","Value":0},
    {"Color":"Green","Value":0},
    {"Color":"Yellow","Value":0},
    {"Color":"Orange","Value":0},
    {"Color":"Red","Value":0}
  ],
  "Temperature":0
}
/**
 * Adding D3 graph data
 * 
 * 
 */
const width = 928;
const height = 500;
const marginTop = 30;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;

// Declare the x (horizontal position) scale.

const x = d3.scaleBand()
    .domain(d3.groupSort(spectralSensorJSONData["SpectralData"], ([d]) => -d.Value, (d) => d.Color)) // descending Value
    .range([marginLeft, width - marginRight])
    .padding(0.1);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
    .domain([0,255])
    .range([height - marginBottom, marginTop]);

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

// Add a rect for each bar.
svg.append("g")
  .selectAll()
  .data(spectralSensorJSONData["SpectralData"], d => d.Color)
  .join("rect")
    .attr("x", (d) => x(d.Color))
    .attr("y", (d) => y(d.Value))
    .attr("height", (d) => y(0) - y(d.Value))
    .attr("width", x.bandwidth());

// Add the x-axis and label.
svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

// Add the y-axis and label, and remove the domain line.
svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickFormat((y) => (y)))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Frequency (%)"));

// Append the SVG element.
container.append(svg.node());

var animationFrameId;
function ChangeGraphData() {
    d3.select("svg").selectAll("rect")
    .data(spectralSensorJSONData["SpectralData"], d => d.Color)
    .transition() // Begin a smooth transition
    .duration(100) // Transition duration in milliseconds
    .attr("y", (d) => y(d.Value))
    .attr("height", (d) => y(0) - y(d.Value))
    .attr("fill", (d) => d.Color.toLowerCase()); // Update color attribute
    animationFrameId = window.requestAnimationFrame(ChangeGraphData.bind(spectralSensorJSONData));

}


async function readSerialData(port) {
  var jsonBuffer = '';
  const textDecoder = new TextDecoder();
  
  while (port.readable) {
    const reader = port.readable.getReader();
    animationFrameId = window.requestAnimationFrame(ChangeGraphData.bind(spectralSensorJSONData));
    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          // Reader has been canceled
          console.log('Reader has been canceled');
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
            spectralSensorJSONData = JSON.parse(message.trim());
            // Here is where you can use the data. For example:
            console.log('Received data:', spectralSensorJSONData);
            
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
          
          // 4. Update the buffer to the remaining part
          jsonBuffer = remainingBuffer;
        }
      }
    } catch (error) {
      console.error('Error reading serial data:', error);
      cancelAnimationFrame(animationFrameId);
    } finally {
      reader.releaseLock();
    }
  }
}

function sendSerialData(port, data) {
    const textEncoder = new TextEncoder();
    const writer = port.writable.getWriter();
    writer.write(textEncoder.encode(data));
    writer.releaseLock();
}

ConnectSerialButton.onclick = async () => {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        // Call the dedicated function to handle data reading
        readSerialData(port);
        //sendSerialData(port, 'Hello from web serial!\n');

    } catch (error) {
        console.error('Error opening serial port:', error);
    }
}

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