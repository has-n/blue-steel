const Store = require("electron-store");

const store = new Store();

const saveSettingsButton = document.getElementById("saveSettingsButton");
const nextCloudUserInput = document.getElementById("nextCloudUser");
const nextCloudPassInput = document.getElementById("nextCloudPass");
const nextCloudURLInput = document.getElementById("nextCloudURL");
const nextCloudUploadInput = document.getElementById("nextCloudUpload");

//Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    saveSettingsButton.addEventListener("click", saveSettings);
});

function loadSettings() {
    nextCloudUserInput.value = store.get("nextCloudUser") ? store.get("nextCloudUser") : "";
    nextCloudPassInput.value = store.get("nextCloudPass") ? store.get("nextCloudPass") : "";
    nextCloudURLInput.value = store.get("nextCloudURL") ? store.get("nextCloudURL") : "";
    nextCloudURLInput.value = store.get("nextCloudUpload") ? nextCloudUploadInput.checked = true : nextCloudUploadInput.checked = false;
}

function saveSettings() {
    store.set("nextCloudUser", nextCloudUserInput.value);
    store.set("nextCloudPass", nextCloudPassInput.value);
    store.set("nextCloudURL", nextCloudURLInput.value);
    store.set("nextCloudUpload", nextCloudUploadInput.checked ? 1 : 0);
}