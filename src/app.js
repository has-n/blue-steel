const {
    desktopCapturer,
    remote,
    ipcRenderer
} = require("electron");

const {
    writeFile
} = require("fs");

const {
    dialog
} = remote;

//Globally scoped variables
var recordedChunks = [];
var mediaRecorder;
var recordingState = false;
var audioContext = new AudioContext();
var videoStream, desktopStream, micStream, webcamStream;

//Configuration
const recordingObject = document.getElementById("recordingObject");
const startRecordButton = document.getElementById("startRecordButton");
const stopRecordButton = document.getElementById("stopRecordButton");

//Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startRecordButton").addEventListener("click", startRecording);
    document.getElementById("stopRecordButton").addEventListener("click", stopRecording);
});

function stopRecording() {
    recordingState = false;

    shutdownWebcamStream();
    shutdownVideoStream();
    shutdownMicStream();
    shutdownDesktopStream();
    toggleRecordButton();

    mediaRecorder.stop();
}

function shutdownDesktopStream() {
    if (desktopStream.active) {
        desktopStream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function shutdownMicStream() {
    if (micStream.active) {
        micStream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function shutdownVideoStream() {
    if (videoStream.active) {
        videoStream.getTracks().forEach(track => {
            track.stop();
        });
    }
}

function shutdownWebcamStream() {
    ipcRenderer.send("close-webcam-window");
}

async function startRecording() {
    //clean up in case we have recorded before
    recordedChunks = [];

    //if already recording, stop recording
    if (recordingState) {
        stopRecording();
    }

    const constraintsVideo = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: recordingObject.value,
            }
        }
    };

    videoStream = await navigator.mediaDevices.getUserMedia(constraintsVideo);

    const constraintsMic = {
        audio: true,
        video: false,
    }

    micStream = await navigator.mediaDevices.getUserMedia(constraintsMic);

    const constraintsDesktop = {
        audio: {
            mandatory: {
                chromeMediaSource: "desktop"
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: "desktop"
            }
        }
    }

    desktopStream = await navigator.mediaDevices.getUserMedia(constraintsDesktop);

    ipcRenderer.send("launch-webcam-window", {
        data: "something"
    });

    let desktopSource = audioContext.createMediaStreamSource(desktopStream);
    let micSource = audioContext.createMediaStreamSource(micStream);
    let destination = audioContext.createMediaStreamDestination();

    desktopSource.connect(destination);
    micSource.connect(destination);

    videoStream.addTrack(...destination.stream.getAudioTracks());
    mediaRecorder = new MediaRecorder(videoStream);

    mediaRecorder.start();
    recordingState = true;
    toggleRecordButton();

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}

function toggleRecordButton() {
    if (recordingState) {
        startRecordButton.style.display = "none";
        stopRecordButton.style.display = "block";
    } else {
        startRecordButton.style.display = "block";
        stopRecordButton.style.display = "none";
    }
}

function handleDataAvailable(chunk) {
    recordedChunks.push(chunk.data);
}

async function handleStop() {

    const blob = new Blob(recordedChunks, {
        type: "video/mp4"
    });

    var arrayBuffer = await getArrayBuffer(blob);

    var buffer = createBuffer(arrayBuffer);

    const {
        filePath
    } = await dialog.showSaveDialog({
        buttonLabel: "Save recording",
        defaultPath: `recording-${Date.now()}.mp4`
    });

    if (filePath) {
        writeFile(filePath, buffer, (error) => {
            console.log("Erro ?" + error);
        })
    }
}

function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
        reader.onload = function () {
            resolve(reader.result);
        }
        reader.onerror = function () {
            reject(reader.error);
        }
    })
}

function getArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
}

function createBuffer(arrayBuffer) {
    let buffer = new Buffer(arrayBuffer.byteLength);
    let arr = new Uint8Array(arrayBuffer);
    for (let i = 0; i < arr.byteLength; i++) {
        buffer[i] = arr[i];
    }
    return buffer;
}

function writeVideoOptions(element, options) {
    options.map(option => {
        var optionItem = document.createElement("option");
        optionItem.text = option.name;
        optionItem.value = option.id;
        element.add(optionItem);
    });
}

async function getVideoSources(types) {
    const sources = await desktopCapturer.getSources({
        types: types
    });
    return sources;
}

async function getMicSources() {

}

function writeMicOptions(element, options) {

}

//Bootstrap
(async () => {
    var screenOptions = await getVideoSources(["screen"]);
    writeVideoOptions(recordingObject, screenOptions);
    /* 
        var micOptions = await getMicSources();
        writeMicOptions(micObject,micOptions); */
})();