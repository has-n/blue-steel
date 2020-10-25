const {
    desktopCapturer,
    remote
} = require("electron");

const recordingObject = document.getElementById("recordingObject");

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