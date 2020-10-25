const {
    desktopCapturer,
    remote
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
    toggleRecordButton();

    mediaRecorder.stop();
}

async function startRecording() {
    //if already recording, stop recording
    if (recordingState) {
        stopRecording();
    }

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: recordingObject.value,
            }
        }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    mediaRecorder = new MediaRecorder(stream);

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

//Bootstrap
(async () => {
    var screenOptions = await getVideoSources(["screen"]);
    writeVideoOptions(recordingObject, screenOptions);
})();