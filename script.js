const connectbutton = document.getElementById('Connect');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

connectbutton.addEventListener('click', async () => {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        console.log('Serial port opened:', port);
        while (port.readable) {
        const reader = port.readable.getReader();
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
    } catch (error) {
        console.error('Error opening serial port:', error);
    }
});
