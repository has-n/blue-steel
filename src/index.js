import {
  app,
  BrowserWindow,
  ipcMain
} from 'electron';

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let webcamPreviewDialog;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 1200,
    //resizable:false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.setMenu(null);

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createWebcamPreviewWindow = () => {
  webcamPreviewDialog = new BrowserWindow({
    parent: mainWindow,
    width: 400,
    height: 250,
    show:false,
    frame:false,
    resizable:false,
    webPreferences: {
      nodeIntegration: true,
    }
  });
  webcamPreviewDialog.setAlwaysOnTop(true);
  webcamPreviewDialog.loadURL(`file://${__dirname}/camera.html`);
}

app.on('ready', () => {
  createWindow();
  createWebcamPreviewWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


ipcMain.on("launch-webcam-window", (event,options) => {
  webcamPreviewDialog.show();
  webcamPreviewDialog.webContents.send("startWebcamStreamEvent",options);
});

ipcMain.on("close-webcam-window", () => {
  //user may have inadvertently closed the webcam preview
  //can't close what isn't active! 
  try {
    webcamPreviewDialog.webContents.send("shutdownWebcamStreamEvent");
    webcamPreviewDialog.hide();
  } catch (error) {
    console.log("Nothing much to be done!");
  }
});