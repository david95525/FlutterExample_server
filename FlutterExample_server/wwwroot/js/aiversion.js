var videoElement = document.getElementById("videoElement");
var scanElement = document.getElementById('Scan');
let scanningElement = document.getElementById("scanning_view");
let closeElement = document.getElementById("Close");
//input
var dateElement = document.getElementById('add_date_scan');
var hourElement = document.getElementById('hour_scan');
var minuteElement = document.getElementById('minute_scan');
var ap_modeElement = document.getElementById("ap_mode_scan");
var sysElement = document.getElementById('sys');
var diaElement = document.getElementById('dia');
var pulElement = document.getElementById('pul');
var base64 = "";
var resultlist = [];
scanElement.addEventListener("click", startCam);
document.getElementById("scan_save_button").addEventListener("click", Back);
closeElement.addEventListener("click", Close);
//date
let nowdate = moment(new Date()).format("YYYY/MM/DD");
dateElement.value = nowdate;
hourElement.value = 10;
minuteElement.value = 12;
//default
scanningElement.setAttribute("hidden", "");
videoElement.setAttribute("hidden", "");
scanElement.innerText = "Scan";
scanElement.removeAttribute("hidden");
document.getElementById("content").textContent = "";
sysElement.value = "";
diaElement.value = "";
pulElement.value = "";

var timeoutID;
var tracks;
function startCam() {
    scanElement.setAttribute("hidden", "");
    videoElement.removeAttribute("hidden");
    closeElement.removeAttribute("hidden");
    //scan
    const constraints = { video: { facingMode: "environment" } };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) {
                videoElement.srcObject = stream;
                tracks = stream.getTracks();
                scanningElement.removeAttribute("hidden");
                timeoutID = window.setInterval(function () {
                    let canvas = document.createElement("canvas");
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    let ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(videoElement, 0, 0, 256, 256);
                    base64 = canvas.toDataURL("image/png", 1);
                    ImageAnalyze();
                }, 5000);
            })
            .catch(function (error) {
                console.log("無法取得視訊串流：", error);
                alert(
                    "您使用的瀏覽器不支援視訊串流，請使用其他瀏覽器，再重新開啟頁面！"
                );
            });
    } else {
        alert("您使用的瀏覽器不支援視訊串流，請使用其他瀏覽器，再重新開啟頁面！");
    }
}
function ImageAnalyze() {
    var base64String = base64.replace('data:image/png;base64,', '');
    let data = { imagestring: base64String };
    let VerificationToken = document.getElementsByName("__RequestVerificationToken")[0].value;
    let config = { headers: { 'requestverificationtoken': VerificationToken } }
    axios.post("/AzureAIVision/ImageAnalyze", data, config)
        .then(function (response) {
            if (response.status === 200) {
                let result = response.data;
                sysElement.value = result.sys;
                diaElement.value = result.dia;
                pulElement.value = result.pul;
                let predictions = [{ value: result.sys, x: 20, y: 25 }, { value: result.dia, x: 20, y: 55 }, { value: result.pul, x: 20, y: 85 }];
                renderPredictions(predictions);
                let content = "";
                resultlist = result.resultlist;
                resultlist.forEach(val => {
                    content = content + " " + val;
                });
                content = content + " " + result.confidence;
                document.getElementById("content").textContent = content;
            }
        }).catch(err => { console.log(err); });
}
function Close() {
    if (timeoutID) {
        window.clearInterval(timeoutID);
    }
    document.getElementById("result_show").remove();
    tracks.forEach((track) => {
        track.stop();
    });
    videoElement.srcObject = null;
    videoElement.setAttribute("hidden", "");
    scanningElement.setAttribute("hidden", "");
    closeElement.setAttribute("hidden", "");
    scanElement.removeAttribute("hidden");
}
function Back() {
    let sys = document.getElementById("sys").value;
    let dia = document.getElementById("dia").value;
    let pul = document.getElementById("pul").value;
    let data = { sys: sys, dia: dia, pul: pul };
    let VerificationToken = document.getElementsByName("__RequestVerificationToken")[0].value;
    let config = { headers: { 'requestverificationtoken': VerificationToken } }
    axios.post("/AzureAIVision/Back", data, config)
        .then(function (response) {
            if (response.status === 200) {
                let result = response.data;
                location.href = result.redirect_uri;
            }
        }).catch(err => { console.log(err); });
}
const renderPredictions = function (predictions) {
    let canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.id = "result_show";
    let ctx = canvas.getContext("2d");
    let scale = 1;
    predictions.forEach(function (prediction) {
        let width = 10;
        let height = 10;
        let x = (prediction.x - width / 2) / scale;
        let y = (prediction.y - height / 2) / scale;

        // Draw the text last to ensure it's on top.
        ctx.font = "16px sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.fillText(prediction.value, x + 4, y + 1);
        ctx.strokeText(prediction.value, x + 4, y + 1);
    });
    canvas.style.top = (document.documentElement.clientHeight - 250) / 2;
    canvas.style.left = (document.documentElement.clientHeight - 300) / 2;
    document.body.append(canvas);
};

