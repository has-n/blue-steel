const Store = require("electron-store");
const { dialog } = require('electron').remote

const store = new Store();

const saveSettingsButton = document.getElementById("saveSettingsButton");
const nextCloudUserInput = document.getElementById("nextCloudUser");
const nextCloudPassInput = document.getElementById("nextCloudPass");
const nextCloudURLInput = document.getElementById("nextCloudURL");
const nextCloudUploadInput = document.getElementById("nextCloudUpload");
const tempFolderPathInput = document.getElementById("tempFolderPath");
const statusAlert = document.getElementById("statusAlert");

//Bootstrap
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    saveSettingsButton.addEventListener("click", saveSettings);
});

function loadSettings() {
    nextCloudUserInput.value = store.get("nextCloudUser") ? store.get("nextCloudUser") : "";
    nextCloudPassInput.value = store.get("nextCloudPass") ? store.get("nextCloudPass") : "";
    nextCloudURLInput.value = store.get("nextCloudURL") ? store.get("nextCloudURL") : "";
    tempFolderPathInput.value = store.get("tempFolderPath") ? store.get("tempFolderPath") : "";
    nextCloudUploadInput.value = store.get("nextCloudUpload") ? nextCloudUploadInput.checked = true : nextCloudUploadInput.checked = false;
}

function saveSettings() {

    if (nextCloudUploadInput.checked 
        && (nextCloudUserInput.value == "" || nextCloudPassInput.value == "" || nextCloudURLInput.value == "")) {
            
            dialog.showMessageBoxSync({
                type:"error",
                message:"All credentials must be provided to automatically upload to NextCloud"
            });
        nextCloudUploadInput.checked=false;
    }

    store.set("nextCloudUser", nextCloudUserInput.value);
    store.set("nextCloudPass", nextCloudPassInput.value);
    store.set("nextCloudURL", nextCloudURLInput.value);
    store.set("tempFolderPath", tempFolderPathInput.value);
    store.set("nextCloudUpload", nextCloudUploadInput.checked ? 1 : 0);

    statusAlert.style.display = "block";
    statusAlert.classList.add("alert-success");
    setTimeout(() => {
        statusAlert.classList.remove("alert-success");
        statusAlert.style.display="none";
    }, 4000);
}