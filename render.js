const { desktopCapturer, remote, app, ipcRenderer } = require("electron");
const axios = require("axios");
const { writeFile } = require("fs");
const mergeImg = require("merge-img");
const Jimp = require("jimp");
const util = require("util");
const electron = require("electron");

//////////////////
// Importing powerMonitor from Main Process
// Using remote Module
const powerMonitor = electron.remote.powerMonitor;

powerMonitor.on("suspend", () => {
  console.log("The system is going to sleep");
  if (running && document.querySelector("#handleCheckbox").checked) {
    document.querySelector("#handleCheckbox").click();
  }
});

powerMonitor.on("resume", () => {
  if (running && !document.querySelector("#handleCheckbox").checked) {
    document.querySelector("#handleCheckbox").click();
  }
  console.log("The system is resuming");
});

powerMonitor.on("on-ac", () => {
  console.log("The system is on AC Power (charging)");
});

powerMonitor.on("on-battery", () => {
  console.log("The system is on Battery Power");
});

powerMonitor.on("shutdown", () => {
  console.log("The system is Shutting Down");
  if (running) document.querySelector("#handleCheckbox").click();
});

powerMonitor.on("lock-screen", () => {
  console.log("The system is about to be locked");
});

powerMonitor.on("unlock-screen", () => {
  console.log("The system is unlocked");
});

const state = powerMonitor.getSystemIdleState(4);
console.log("Current System State - ", state);

const idle = powerMonitor.getSystemIdleTime();
console.log("Current System Idle Time - ", idle);
//////////////////////

// idle
let totalIdleTime = 0;
let currSsIdleTime = 0;
let currActIdleTime = 0;
ipcRenderer.on("idle:true", (e, idleTime) => {
  // console.log(idleTime);
  if (idleTime > apause * 60) {
    console.log("stop the recording here");
    setTimeout(() => {
      new Notification("Monitoring Stopped", {
        body: "Your Screen Monitoring has been stopped due to inactivity",
      });
    }, 4000);

    document.querySelector("#handleCheckbox").click();
  }
  currActIdleTime = currActIdleTime + 1;
  currSsIdleTime = currSsIdleTime + 1;
  totalIdleTime = totalIdleTime + 1;
});

const fs = require("fs");
// let ep = "https://ssmonitor-backend.herokuapp.com/";
let ep = "http://localhost:8000/";
let settings = 0;
let running = false;
let isInternal = false;
let currSsTimer = 0;
let curUserID = 0;
let curProjectID = 0;
let curClientId = 0;
let curTaskID = 0;
let curProjectS;
let curProjectIDS;
let curClientIdS;
// let curSubTaskID = 0;
let userProjects = [
  // {
  //   _id: 1,
  //   name: "pro1",
  //   clientId: "1c",
  //   clientName: "c1",
  //   consumetime: 300,
  // },
  // {
  //   _id: 2,
  //   name: "pro2",
  //   clientId: "2c",
  //   clientName: "c2",
  //   consumetime: 100,
  // },
  // {
  //   _id: 3,
  //   name: "pro3",
  //   clientId: "3c",
  //   clientName: "c3",
  //   consumetime: 6600,
  // },
];
// let userClients = [];
// let userClientsD = {};
let curActivity = new Date().getTime();
let curActivityId = "";
let performanceData = 100;
let avgPerformance = 100;
let ppp = 0;
let userData = {};
let curProject = {};
let daysFull = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let daysSort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let sstime = 600000;
let apause = 5;

const { dialog, Menu } = remote;
let lastCaptured = "";
let gggc = 1;
let timmer = 0;
let intVaal = 0;
let intCapt = 0;

reqHeaders = {
  Authorization: "Bearer ",
};

let mediaRecorder;
const recordedChunks = [];

// intExt
function intExt() {
  const btn = document.querySelector("#intExt");
  isInternal = btn.checked;
}

// get projects. change this to our api
function callProjects() {
  axios.get(ep + "project", { headers: reqHeaders }).then((resP) => {
    userProjects = resP.data.data;
    console.log(userProjects);
    renderProjects(userProjects);
    selectProject(0);
  });
  console.log("projectsLoaded");
}
let recording = true;

// onclick select projects.
async function selectProject(idx) {
  if (
    document.querySelector("#handleCheckbox").checked &&
    curProject !== userProjects[idx]
  ) {
    if (confirm("This will stop the current Project timer")) {
      document.querySelector("#handleCheckbox").click();
    } else {
      return;
    }
  }
  if (userProjects.length !== 0) {
    curProject = userProjects[idx];
    // curProjectID = userProjects[idx]["_id"];
    // curClientId = userProjects[idx]["client"];
    ///////////////old...,..........
    // curProject = userProjects[idx];
    // curProjectID = userProjects[idx]["_id"];
    // curClientId = userProjects[idx]["client"];
    // send a req to show current active project
    // axios
    //   .post(
    //     ep + "kcs/list/smtasks",
    //     { project: curProjectID, status: "active" },
    //     { headers: reqHeaders }
    //   )
    //   .then((resP) => {
    // let hc = "";
    // for (let i = 0; i < resP.data.length; i++) {
    //   if (i == 0) {
    //     hc =
    //       hc +
    //       "<option value='" +
    //       resP.data[i]["_id"] +
    //       "' selected>" +
    //       resP.data[i]["name"] +
    //       "</option>";
    //   } else {
    //     hc =
    //       hc +
    //       "<option value='" +
    //       resP.data[i]["_id"] +
    //       "' >" +
    //       resP.data[i]["name"] +
    //       "</option>";
    //   }
    // }
    // if (resP.data.length == 0) {
    //   hc = hc + "<option value='0' selected>No Tasks!</option>";
    // }
    // render the name of the selected task
    // document.getElementById("selectTask").innerHTML = hc;

    const tm = secondsToHms(curProject.consumetime, "h:mm");
    document.getElementById("hProjectName").innerHTML = curProject.name;
    document.getElementById("hClientName").innerHTML = curProject.client.name;
    // userClientsD[curProject.client]["name"];
    // document.getElementById("hProjectDesc").innerHTML = curProject.description;
    document.getElementById("hProjectDesc").innerHTML = "SOME DESCRIPTION";
    document.getElementById("hDayOfWeek").innerHTML =
      daysSort[new Date().getDay()];
    document.getElementById("hConsumeTime").innerHTML = tm + " hrs";
    document.getElementById("hOutOfTime").innerHTML =
      secondsToHms(curProject.consumeTime) +
      " of " +
      curProject.budgetTime +
      " hrs";
    document.getElementById("timId").innerHTML = secondsToHms(
      curProject.consumetime
    );
  } else {
    document.getElementById("hProjectName").innerHTML = "-";
    document.getElementById("hClientName").innerHTML = "-";
    // userClientsD[curProject.client]["name"];
    // document.getElementById("hProjectDesc").innerHTML = curProject.description;
    document.getElementById("hProjectDesc").innerHTML = "-";
    document.getElementById("hDayOfWeek").innerHTML =
      daysSort[new Date().getDay()];
    document.getElementById("hConsumeTime").innerHTML = "00" + " hrs";
    document.getElementById("hOutOfTime").innerHTML =
      "00" + " of " + "00" + " hrs";
    document.getElementById("timId").innerHTML = "00:00";
  }

  // });
}

async function searchProjects(t) {
  if (t.value == "") {
    refreshProjects();
  }
  if (t.value.length < 3) return;
  callProjects({
    employees: curUserID,
    status: "active",
    name: { $regex: ".*" + t.value + ".*" },
  });
}

async function refreshProjects() {
  document.getElementById("search").value = "";
  callProjects({ employees: curUserID, status: "active" });
}

function renderProjects(projectList) {
  let hc = '<div class="col">';
  if (projectList.length == 0)
    hc = hc + "<h1 style='text-align: center;'>No project found!</h1>";

  for (let i = 0; i < projectList.length; i++) {
    const p = projectList[i];

    p["consumetime"] = p.consumetime > 0 ? p.consumetime : 0;
    hc = hc + '<div class="row">';
    hc =
      hc +
      '<div onclick="selectProject(' +
      i +
      ');" class="col-7" style="text-align: left; cursor: pointer;">';
    // i +
    //   ");document.getElementById('task-details').style='display: block;';document.getElementById('main-details').style='display: none;';\" class=\"col-7\" style=\"text-align: left; cursor: pointer;\">";
    hc =
      hc + '<h5 style="color: green; margin-bottom: 0px;">' + p.name + "</h5>";
    hc = hc + '<span style="font-size: 12px;">' + p?.client?.name;
    // p.clientName +
    // userClientsD[p.client]["name"] +
    ", " + p.description + "</span>";
    hc = hc + "</div>";
    hc = hc + '<div class="col-5" style="text-align: right;">';
    hc =
      hc +
      '<h5 style="margin-bottom: 0px;">' +
      secondsToHms(p.consumeTime) +
      "</h5>";
    hc = hc + '<div class="progress" style="height: 5px; margin-top:5px;">';
    hc =
      hc +
      '<div class="progress-bar" role="progressbar" style="width: ' +
      (p.budgetTime === 0
        ? 100
        : (p.consumeTime * 100) / (p.budgetTime * 3600)) +
      '%; background-color: green;" aria-valuenow="' +
      (p.consumeTime * 100) / (p.budgetTime * 3600) +
      '" aria-valuemin="0" aria-valuemax="100"></div>';
    hc = hc + "</div>";
    hc =
      hc +
      '<span style="font-size: 12px;">of ' +
      (p.budgetTime === 0 ? "No budget Time " : p.budgetTime + "hr") +
      "</span>";
    hc = hc + "</div>";
    hc = hc + '<div class="col" >';
    hc = hc + "<hr />";
    hc = hc + "</div>";
    hc = hc + "</div>";
  }
  hc = hc + "</div>";
  document.getElementById("allprojectsv").innerHTML = hc;
}

// --- combined into login button ----------
// async function callback(error, response, body) {
//   if (!error && response.statusCode == 200) {
//     userData["gmail"] = body;
//     axios.post(ep + "glogin", { password: ctoken.access_token }).then((res) => {
//       if (res && res.data && res.data.token) {
//         reqToken = res.data.token;
//         reqHeaders["Authorization"] = "Bearer " + res.data.token;
//         userData["server"] = res.data.server;
//         curUserID = res.data.server._id;
//         // settings variable
//         axios
//           .post(ep + "kcs/list/smemployees", { uid: curUserID })
//           .then((resEE) => {
//             if (resEE && resEE.data && resEE.data.length > 0) {
//               userData["settings"] = resEE.data[0];
//               apause = resEE.data[0]["autopause"];
//               sstime = resEE.data[0]["imagerate"] * 60000;
//             }
//           });
//         axios
//           .post(ep + "kcs/list/smclient", {}, { headers: reqHeaders })
//           .then((resC) => {
//             userClients = resC.data;
//             for (let m = 0; m < resC.data.length; m++) {
//               userClientsD[resC.data[m]["_id"]] = resC.data[m];
//             }
//             // get projects
//             callProjects({ employees: curUserID, status: "active" });
//             document.getElementById("login-details").style = "display:none";
//             document.getElementById("main-details").style =
//               "display: block; margin: 15px;margin-top: 0px;";
//             document.getElementById("footer").style = "display: block";
//             document.getElementById("user-name").innerHTML = body.name;
//           });
//       }
//     });
//   } else {
//     document.getElementById("errorL").innerHTML =
//       "You are not registered, Please contact Admin.";
//   }
// }

// LOGIN ////////////////////////////////////////////////////////////////

function loadSettings() {
  const s = settings.ScreenShotPerHour.isTeamSetting
    ? settings.ScreenShotPerHour.teamValue
    : settings.ScreenShotPerHour.individualValue;
  sstime = 3600000 / s;
  if (s === 0) sstime = 6000000;
  else sstime = 3600000 / s;
  const apause = settings.AutoPause.isTeamSetting
    ? settings.AutoPause.teamValue
    : settings.AutoPause.individualValue;
  console.log(sstime, " ", apause * 60, " ");
}

function loadTime(data) {
  const { dailyHours, monthlyTime, weeklyTime } = data;
  document.querySelector("#todayTotal").innerText =
    "Today: " +
    (dailyHours.length !== 0
      ? secondsToHms(dailyHours[0].totalHours)
      : secondsToHms(0));
  document.querySelector("#monthlyTotal").innerText =
    "Month: " +
    (weeklyTime.length !== 0
      ? secondsToHms(weeklyTime[0].totalHours)
      : secondsToHms(0));
  document.querySelector("#weeklyTotal").innerText =
    "Week: " +
    (monthlyTime.length !== 0
      ? secondsToHms(monthlyTime[0].totalHours)
      : secondsToHms(0));
}

let cdInt = 0;
function commonDataInterval(d) {
  if (d) {
    cdInt = setInterval(async () => {
      const { data } = await axios.post(
        ep + `commondata`,
        {},
        {
          headers: reqHeaders,
        }
      );
      loadTime(data);
    }, 60000);
  } else {
    clearInterval(cdInt);
  }
}
let laInt = 0;
function lastActiveInterval(d) {
  if (d) {
    axios.post(
      ep + "activity/lastActive",
      { lastActive: new Date().getTime() },
      {
        headers: reqHeaders,
      }
    );
    laInt = setInterval(async () => {
      const { data } = await axios.post(
        ep + "activity/lastActive",
        { lastActive: new Date().getTime() },
        {
          headers: reqHeaders,
        }
      );
    }, 120000);
    console.log(laInt);
  } else {
    axios.post(
      ep + "activity/lastActive",
      { lastActive: new Date().getTime() },
      {
        headers: reqHeaders,
      }
    );
    clearInterval(laInt);
  }
}

const btn = document.querySelector("#start-auth");
btn.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("errorL").innerHTML = "";
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPass").value;
  axios
    .post(ep + "login", { email, password })
    .then(async (res) => {
      if (res.data.status === "success") {
        // reqToken = res.data.token;
        // userData["server"] = res.data.server;
        // curUserID = res.userData._id;
        reqHeaders["Authorization"] = "Bearer " + res.data.token;
        console.log(reqHeaders);
        // // getcommondata for settings
        const { data } = await axios.post(
          ep + `commondata`,
          {},
          {
            headers: reqHeaders,
          }
        );
        loadTime(data);
        settings = data.user.settings;
        loadSettings();
        commonDataInterval(true);
        console.log(data);
        console.log(settings);
        document.getElementById("login-details").style = "display:none";
        document.getElementById("main-details").style =
          "display: block; margin: 15px;margin-top: 0px;";
        document.getElementById("footer").style = "display: block";
        document.getElementById("user-name").innerHTML =
          res.data.user.firstName;
        document.getElementById("task-details").style = "display: block";
      }
      callProjects();
      // selectProject(0);
    })
    .catch((err) => {
      document.getElementById("errorL").innerHTML =
        "You are not registered, Please contact Admin.";
    });
});

function showSettings() {
  document.getElementById("myDropdown").classList.toggle("show");
}
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

// btn.setAttribute("disabled", true);
// iioauth2Client = new ElectronGoogleOAuth2(
//   gDetails.id,
//   gDetails.sd,
//   gDetails.scope,
//   {
//     successRedirectURL: "http://kcss.in",
//     loopbackInterfaceRedirectionPort: 42813,
//     refocusAfterSuccess: true,
//   }
// );

// iioauth2Client.openAuthWindowAndGetTokens().then(async (token) => {
//   ctoken = token;
//   oAuth2Client1.setCredentials(token);
//   options.method = "GET";
//   options.url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
//   options.headers = {
//     Authorization: "Bearer " + token.access_token,
//   };
// request(options, callback);
// });
// });

const videoElement = document.querySelector("video");

const startBtn = document.getElementById("startBtn");
startBtn.onclick = (e) => {
  mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
};

const stopBtn = document.getElementById("stopBtn");
stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

// not used idk why
async function doScreens() {
  const inputSources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 1024, height: 768 },
  });
}

let getBuff = (image) => {
  return new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err, buff) => {
      if (err) reject(err);

      resolve(buff);
    });
  });
};

async function doCapture(d) {
  const photos = [];
  const inputSources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1024, height: 768 },
  });

  const inputSourcesWin = await desktopCapturer.getSources({
    types: ["window"],
    thumbnailSize: { width: 1024, height: 768 },
  });
  // title
  let title = "None";
  if (inputSourcesWin && inputSourcesWin.length > 0) {
    title = inputSourcesWin[0]["name"];
  }
  // //////MERGE///////////// //
  // buffers to pass to mergeImg
  let images = [];
  // to use in new File
  let newBuff = "newBuff";
  if (inputSources.length > 1) {
    for (let i = 0; i < inputSources.length; i++) {
      images.push(inputSources[i].thumbnail.toPNG());
    }
    const fuck = await mergeImg(images);
    newBuff = await getBuff(fuck);
  } else {
    newBuff = inputSources[0].thumbnail.toPNG();
  }
  const fileName = makeid(10) + "-" + new Date().getTime() + ".png";
  const filePath = "./images/captured/" + fileName;
  const ffile = new File([newBuff], "foo.png", {
    type: "image/png",
  });
  var formData = new FormData();
  formData.append("image", ffile);
  const newHed = { "Content-Type": "multipart/form-data" };
  // upload the ss and then upload the details of the img.
  axios.post(ep + "upload", formData, { headers: newHed }).then((resP) => {
    // img details uploaded only when true is passed which is passed during the interval and ending the act.
    if (d) {
      const actData = {
        projectId: curProject._id,
        clientId: curProject.client._id,
        consumeTime: currSsTimer,
        // task: curTaskID,
        // image: resP.data.path,
        image: "https://i.ibb.co/dt49XwW/image-1641720419332.png",
        activityAt: new Date().getTime(),
        // activity: curActivity,
        activityId: curActivityId,
        performanceData:
          Math.round((100 - (currSsIdleTime / currSsTimer) * 100) * 100) / 100,
        title: title,
      };
      axios
        .post(ep + "activity/screenshot", actData, {
          headers: reqHeaders,
        })
        .then((resPK) => {});
      if (document.querySelector("#handleCheckbox").checked) {
        const actDataAct = {
          newDailyHours: 0,
          newProjectHours: 0,
          endTime: new Date().getTime(),
          projectId: curProject._id,
          consumeTime: curProject.consumetimeCur,
          performanceData:
            Math.round(
              (100 - (currActIdleTime / curProject.consumetimeCur) * 100) * 100
            ) / 100,
        };
        axios
          .patch(ep + `activity/${curActivityId}`, actDataAct, {
            headers: reqHeaders,
          })
          .then((resPK) => {
            performanceData = 100;
            avgPerformance = 100;
            currSsIdleTime = 0;
            currSsTimer = 0;
          });
      }
      // also send a req to update the project consume time as well
      // for both projects, in user and also in projects schema
    }
  });
  ////////////////////////////////////////////////////////////copy
  // axios.post(ep + "uploadile", formData, { headers: newHed }).then((resP) => {
  //   if (d) {
  //     const actData = {
  //       file: resP.data,
  //       employee: curUserID,
  //       project: curProjectID,
  //       task: curTaskID,
  //       image: resP.data.filename,
  //       activityat: new Date(),
  //       activity: curActivity,
  //       activityid: curActivityId,
  //       performanceData: performanceData,
  //       title: title,
  //     };
  //     axios
  //       .post(ep + "kcs/smactivityimage", actData, { headers: reqHeaders })
  //       .then((resPK) => {});
  //     const actDataAct = {
  //       endTime: new Date(),
  //       consumetime: parseInt(curProject.consumetimeCur),
  //       performanceData: avgPerformance,
  //     };
  //     axios
  //       .put(ep + "kcs/smactivity/" + curActivityId, actDataAct, {
  //         headers: reqHeaders,
  //       })
  //       .then((resPK) => {
  //         performanceData = 100;
  //         avgPerformance = 100;
  //       });
  //   }
  // });
  /////////////////////////////////////copy
  // writeFile(filePath, newBuff, () => {});
  // fix this, make this to take the last full ss
  const img = {
    dataURL: inputSources[0].thumbnail.toDataURL(),
    path: filePath,
  };
  photos.push(img);
  return photos;
}

async function setLastImage(d) {
  const p = await doCapture(d);
  if (p && p.length > 0) {
    lastCaptured = p[0]["dataURL"];
    document.getElementById("lastImage").src = lastCaptured;
  }
  if (d) {
    setTimeout(() => {
      new Notification("Screenshot Captured", {
        body: "Your screenshot captured sucessfully;",
      });
    }, 4000);
  }
}

async function handleCapture(t) {
  ipcRenderer.send("idle:start");
  curTaskID = document.getElementById("selectTask").value;
  if (t.checked) {
    // running for sleep events
    running = true;
    // disable the intExt
    document.querySelector("#intExt").disabled = true;
    // reset the idle time for the activity
    currActIdleTime = 0;
    // just a name, not id
    curActivity = makeid(10) + "-" + new Date().getTime();
    // last active interval
    lastActiveInterval(true);
    // set last image false
    setLastImage(false);
    // start the current timer from 0
    runTimmer(true, 0);
    // run setlastimage on interval
    runCapture(true);
    // reset the currentime of project
    curProject["consumetimeCur"] = 0;
    // set the start Date of the project
    curProject["startD"] = new Date();
    const actData = {
      isAccepted: true,
      isInternal: isInternal,
      clientId: curProject.client._id,
      projectId: curProject._id,
      // task: curTaskID,
      startTime: new Date().getTime(),
      endTime: new Date().getTime(),
      // activity: curActivity,
      performanceData: 100,
      consumeTime: 0,
    };
    console.log(actData);
    // update the activity and
    // send req to make a new id and retrieve the id.
    // initial performance is 100.
    axios
      .post(ep + "activity", actData, { headers: reqHeaders })
      .then((resPK) => {
        curActivityId = resPK.data.activity._id;
      });

    setTimeout(() => {
      new Notification("Start Monitoring", {
        body: "Your " + "screenshot monitoring is started sucessfully;",
      });
    }, 4000);

    // on stop the activity
  } else {
    ipcRenderer.send("idle:stop");
    // running false
    running = false;
    // enable the intExt
    document.querySelector("#intExt").disabled = false;
    // last active interval
    lastActiveInterval(false);
    // run setlastimage for one last time
    setLastImage(true);
    // clear interval
    runTimmer(false, curProject.consumetime);
    // stop the interval for setlastimage
    runCapture(false);
    // set the stop date for the project
    curProject["stopD"] = new Date();
    // update the total time of the project
    curProject.consumetime =
      parseInt(curProject.consumetimeCur) + parseInt(curProject.consumetime);
    const tm = secondsToHms(parseInt(curProject.consumetime), "h:mm");
    document.getElementById("hConsumeTime").innerHTML = tm + " hrs";
    document.getElementById("hOutOfTime").innerHTML =
      tm + " of " + curProject.hours + " hrs";
    // update the end time of the activity and also the time consumed and performance
    const actData = {
      projectId: curProject._id,
      endTime: new Date().getTime(),
      consumeTime: curProject.consumetimeCur,
      newProjectHours: !isInternal ? curProject.consumetimeCur : 0,
      newDailyHours: curProject.consumetimeCur,
      performanceData:
        Math.round(
          (100 - (currActIdleTime / curProject.consumetimeCur) * 100) * 100
        ) / 100,
    };
    axios
      .patch(ep + `activity/${curActivityId}`, actData, {
        headers: reqHeaders,
      })
      .then((resPK) => {});
    // setTimeout(() => {
    //   new Notification("Stop Monitoring", {
    //     body: "Your screenshot monitoring is stopped sucessfully;",
    //   });
    // }, 2000);
  }
}

function runTimmer(t, s) {
  if (t) {
    intVaal = setInterval(() => {
      s++;
      curProject.consumetimeCur = curProject.consumetimeCur + 1;
      currSsTimer = currSsTimer + 1;
      document.getElementById("timId").innerHTML = secondsToHms(s);
    }, 1000);
  } else {
    clearInterval(intVaal);
  }
}

function runCapture(t) {
  if (t) {
    intCapt = setInterval(() => {
      setLastImage(true);
    }, sstime);
  } else {
    clearInterval(intCapt);
  }
}

async function handleCapture1(t) {
  if (t.checked) {
    const inputSources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1024, height: 768 },
    });
    await selectSource(inputSources[0]);
    lastCaptured = inputSources[0].thumbnail.toDataURL();
    document.getElementById("lastImage").src = lastCaptured;
    mediaRecorder.start();
    intVaal = setInterval(() => {
      timmer++;
      document.getElementById("timId").innerHTML = secondsToHms(timmer);
    }, 1000);
  } else {
    mediaRecorder.stop();
    clearInterval(intVaal);
  }
}

const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

async function getVideoSources() {
  alert(desktopCapturer);
  const inputSources = await desktopCapturer.getSources({
    types: ["screen"],
  });
  alert(inputSources);
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );

  videoOptionsMenu.popup();
}

async function selectSource(source) {
  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  videoElement.srcObject = stream;
  videoElement.play();

  const options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
  recordedChunks.push(e.data);
}

async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());
  gggc++;
  filePath = "assets/videos/video_" + gggc + ".webm";

  if (filePath) {
    writeFile(filePath, buffer, () => {});
  }
  recordedChunks.splice(0, recordedChunks.length);
}

function secondsToHms(d, ttt = "hrm") {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  if (ttt == "h:mm") {
    var hDisplay = h > 0 ? h : "0";
    var mDisplay = m > 0 ? (m < 10 ? "0" + m : m) : "00";
    var sDisplay = "";
    return hDisplay + ":" + mDisplay + sDisplay;
  } else {
    var hDisplay = h > 0 ? h + (h == 1 ? " hr " : " hrs ") : "0 hr ";
    var mDisplay = m > 0 ? m + (m == 1 ? " m" : " m") : " 00 m";
    var sDisplay = "";
    return hDisplay + mDisplay + sDisplay;
  }
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const dir = "./images/captured";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, {
    recursive: true,
  });
}

function eventHandler(event) {}

function logout() {
  location.reload();
  commonDataInterval(false);
}
``;

// search functionality.
const search = document.getElementById("search");
let search_term = "";

const showList = () => {
  const newData = userProjects.filter((item) => {
    return (
      item.name.toLowerCase().includes(search_term) ||
      item.client.name.toLowerCase().includes(search_term)
    );
  });
  renderProjects(newData);
};

search.addEventListener("input", (event) => {
  search_term = event.target.value.toLowerCase();
  showList();
});
