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
closeElement.addEventListener("click", function () {
    Close();
    closeElement.setAttribute("hidden", "");
    customscanElement.removeAttribute("hidden");
    scanElement.removeAttribute("hidden");
});
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
function videoDimensions(video) {
    // Ratio of the video's intrisic dimensions
    let videoRatio = video.videoWidth / video.videoHeight;
    // The width and height of the video element
    let width = video.offsetWidth, height = video.offsetHeight;
    // The ratio of the element's width to its height
    let elementRatio = width / height;
    // If the video element is short and wide
    if (elementRatio > videoRatio) width = height * videoRatio;
    // It must be tall and thin, or exactly equal to the original ratio
    else height = width / videoRatio;
    return [width, height];
}
function Close() {
    if (document.getElementById("result_show")) {
        document.getElementById("result_show").remove();
    }
    tracks.forEach((track) => {
        track.stop();
    });
    videoElement.srcObject = null;
    videoElement.setAttribute("hidden", "");
    scanningElement.setAttribute("hidden", "");
    document.getElementById("content").textContent = "";
}
function startCam() {
    scanElement.setAttribute("hidden", "");
    customscanElement.setAttribute("hidden", "");
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
                timeoutID = window.setTimeout(function () {
                    let canvas = document.createElement("canvas");
                    let [width, height] = videoDimensions(videoElement);
                    canvas.width = width;
                    canvas.height = height;
                    let ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(videoElement, 0, 0, width, height);
                    base64 = canvas.toDataURL("image/png", 1);
                    ImageAnalyze();
                }, 2000);
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
                scanningElement.setAttribute("hidden", "");
                let result = response.data;
                sysElement.value = result.sys;
                diaElement.value = result.dia;
                pulElement.value = result.pul;
                let locations = result.locations;
                if (locations.length === 0) {
                    locations = [{ x1: 0, x2: 0, y1: 0, y3: 0 }, { x1: 0, x2: 0, y1: 0, y3: 0 }, { x1: 0, x2: 0, y1: 0, y3: 0 }]
                }
                let predictions = [
                    {
                        value: result.sys.toString(), x: 10, y: 25,
                        x1: locations[0].x1,
                        x2: locations[0].x2,
                        y1: locations[0].y1,
                        y3: locations[0].y3
                    },
                    {
                        value: result.dia.toString(), x: 10, y: 65,
                        x1: locations[1].x1,
                        x2: locations[1].x2,
                        y1: locations[1].y1,
                        y3: locations[1].y3
                    },
                    {
                        value: result.pul.toString(), x: 10, y: 105,
                        x1: locations[2].x1,
                        x2: locations[2].x2,
                        y1: locations[2].y1,
                        y3: locations[2].y3
                    }];
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
    canvas.id = "result_show";
    let [width, height] = videoDimensions(videoElement);
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d");
    predictions.forEach(function (prediction) {
        if (prediction.x1 != 0 && prediction.value != "0") {
            let width = prediction.x2 - prediction.x1;
            let height = prediction.y3 - prediction.y1;
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(
                prediction.x1,
                prediction.y1,
                width,
                height
            );
        }
        let textwidth = 10;
        let textheight = 10;
        let length = 1;
        if (prediction.value.length === 1) {
            length = 10;
        }
        else if (prediction.value.length === 2) {
            length = 4;
        }
        let x = (prediction.x + textwidth / 2);
        let y = (prediction.y + textheight / 2);
        ctx.fillStyle = "red";
        ctx.fillRect(prediction.x, prediction.y, 44, 26);
        // Draw the text last to ensure it's on top.
        ctx.font = "20px sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = "white";
        ctx.fillText(prediction.value, x + length, y + 1);
        //ctx.strokeStyle = '#000000';
        //ctx.lineWidth = 0.5;
        //ctx.strokeText(prediction.value, x + length, y + 1);

    });
    document.body.append(canvas);
};


