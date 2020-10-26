const {
    ipcRenderer
} = require("electron");

var webcamStream;
const webcamPreview = document.getElementById("webcamPreview");

ipcRenderer.on("startWebcamStreamEvent",(event,options)=>{

    const webcamConstraints = {
        audio: false,
        video: {
            mandatory: {
                minWidth: 300,
                minHeight: 300,
                chromeMediaSourceId : options.deviceId,
            }
        }
    };

    navigator.mediaDevices.getUserMedia(webcamConstraints).then((stream) => {
        webcamStream = stream;
        webcamPreview.srcObject = stream;
        webcamPreview.play();
    });

});

ipcRenderer.on("shutdownWebcamStreamEvent", () => {
    console.log("shutting down");
    if (webcamStream.active) {
        webcamStream.getTracks().forEach(track => {
            track.stop();
        });
    }
});