const {
  app,
  BrowserWindow,
  powerMonitor,
  webContents,
  ipcMain,
} = require("electron");
var fs = require("fs");

// dev/prod
process.env.NODE_ENV = "production";
const isDev = process.env.NODE_ENV !== "production" ? true : false;

if (process.platform === "win32") {
  app.name = "Meru Accounting";
  app.setAppUserModelId(app.name);
}

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 500,
    height: 800,
    resizable: isDev,
    icon: "assets/images/meru1024.png",
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: isDev,
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

function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");
  const path = require("path");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true,
      });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(application.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      application.quit();
      return true;
  }
}
