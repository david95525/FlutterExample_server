var videoElement = document.getElementById("videoElement");
var scanElement = document.getElementById('Scan');
var loadingElement = document.getElementById("scan_lodding");
let scanningElement = document.getElementById("scanning_view");
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
document.getElementById('Scan').addEventListener("click", startCam);
//date
let nowdate = moment(new Date()).format("YYYY/MM/DD");
dateElement.value = nowdate;
hourElement.value = 10;
minuteElement.value = 12;
//default
if (document.getElementById("capture")) {
    document.getElementById("capture").remove();
}
loadingElement.setAttribute("hidden", "");
scanningElement.setAttribute("hidden", "");
videoElement.setAttribute("hidden", "");
scanElement.innerText = "Scan";
scanElement.removeAttribute("hidden");
document.getElementById("content").textContent = "";
sysElement.value = "";
diaElement.value = "";
pulElement.value = "";

function RenderscanDate() {
    try {

    }
    catch (e) {
        console.log(e);
    }
}
function startCam() {
    let captureElement = document.createElement('button');
    captureElement.classList.add("btn-style-2");
    captureElement.id = "capture";
    captureElement.textContent = "Capture";
    scanElement.after(captureElement);
    scanElement.setAttribute("hidden", "");
    videoElement.removeAttribute("hidden");
    //scan
    const constraints = { video: { facingMode: "environment" } };
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) {
                videoElement.srcObject = stream;
                scanningElement.removeAttribute("hidden");
                captureElement.addEventListener("click", function () {
                    captureElement.remove();
                    loadingElement.removeAttribute("hidden");
                    let canvas = document.createElement("canvas");
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    let ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(videoElement, 0, 0, 256, 256);
                    base64 = canvas.toDataURL("image/png", 1);
                    //hidden    
                    scanningElement.setAttribute("hidden", "");
                    videoElement.setAttribute("hidden", "");
                    scanElement.innerText = "Rescan";
                    scanElement.removeAttribute("hidden");
                    Upload();
                });
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
function Upload() {
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
                let content = "";
                resultlist = result.resultlist;
                resultlist.forEach(val => {
                    content = content + " " + val;
                });
                content = content + " " + result.confidence;
                document.getElementById("content").textContent = content;
                loadingElement.setAttribute("hidden", "");
            }
        }).catch(err => { console.log(err); });
}




