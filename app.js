const {
  app,
  BrowserWindow,
  powerMonitor,
  webContents,
  ipcMain,
} = require("electron");
var fs = require("fs");

if (process.platform === "win32") {
  app.name = "KC Screen Monitoring";
  app.setAppUserModelId(app.name);
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 360,
    height: 600,
    icon: "assets/images/icon.png",
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  console.log(app.getPath("userData"));
  const dir = app.getPath("userData") + "/assets/images/captured/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});

// idle ///////////////////////////////////
let isIdle;
let idleCheck = null;
// send event from app when starting the timer to start the interval.
ipcMain.on("idle:start", () => {
  // console.log(idleCheck);
  // to avoid multiple intervals
  if (idleCheck === null || idleCheck._destroyed === true) {
    idleCheck = setInterval(() => {
      isIdle = powerMonitor.getSystemIdleState(1);
      if (isIdle === "idle") {
        win.webContents.send("idle:true", powerMonitor.getSystemIdleTime());
      } else {
        win.webContents.send("idle:false");
      }
    }, 1000);
  }
});
// send event from app when stoping the timer to stop the interval.
ipcMain.on("idle:stop", () => {
  console.log("received");
  clearInterval(idleCheck);
  console.log(idleCheck);
});
// make a function to calculate idle time percentage and put it into performance variable, avg, total and activity wise.

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
