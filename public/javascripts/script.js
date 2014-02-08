"use strict";

function drawPCM(cvs_element, points, line_color /* default = black */, line_width ) {
  cvs_element = cvs_element || document.getElementById("visualizer");
  var ctx = cvs_element.getContext("2d")
    , len = points.length - 1
    , w = cvs_element.width
    , h = cvs_element.height
    , GAIN = h
    ctx.clearRect(0, 0, cvs_element.width, cvs_element.height);

  line_color = line_color || "#000";
  line_width = line_width || 1;


  ctx.beginPath();
  ctx.strokeStyle = line_color;
  ctx.lineWidth = line_width;
  ctx.lineCap = "round";

  for(var i = 0, l = points.length; i < l; i++) {
    var method = i === 0 ? "moveTo" : "lineTo"
      var x = w / len * i
        , y = (1 - points[i] / 255) * GAIN;

    ctx[method](x, y)
  }

  ctx.stroke();
}

var VoiceAnalyzer = function(){
  this.audioContext = new webkitAudioContext();
  this.analyzer = this.audioContext.createAnalyser();
  this.mediastreamsource = null;
  this.fftSize = 0;
  this.flagRecording = false;
  this.timerRecording = null;
  this.RECORD_INTERVAL = 5000;
  this.PRECISE_INTERVAL = 32;
  this.SUM_THRESH = 5000;

  this.recordedDatas = []
  this.prevFFT;
  this.deltaFFT;
};

VoiceAnalyzer.prototype.start = function(stream){
  this.mediastreamsource = this.audioContext.createMediaStreamSource(stream);
  this.mediastreamsource.connect(this.analyzer);
  this.fftSize = this.analyzer.fftSize
  // this.deltaFFT = new Uint8Array(this.fftSize / 2);

  this.getDatas();
  // this.analyzer.connect(this.audioContext.destination);
}

VoiceAnalyzer.prototype.startRecording = function(){
  if(this.flagRecording) {
    throw("Already started recording...");
  }
  this.flagRecording = true;
  this.recordedDatas.length = 0;
  $("#recorded").empty();
  $("#btnRecord").attr("disabled", true);

  this.timerRecording = setTimeout(function(){
    this.flagRecording = false;
    this.timerRecording = null;
    $("#btnRecord").attr("disabled", false);
  }.bind(this), this.RECORD_INTERVAL);
}

VoiceAnalyzer.prototype.stopRecording = function(){
  if(!this.flagRecording) {
    throw("Recording not started");
  }
  this.flagRecording = false;
  if(this.timerRecording) {
    clearTimeout(this.timerRecording);
    this.timerRecording = null;
    $("#btnRecord").attr("disabled", false);
  }
}

VoiceAnalyzer.prototype.calcDeltaFFT = function(fft){
  var d_;
  if(!!this.prevFFT === false) {
    this.deltaFFT = new Uint8Array(this.fftSize / 2);
  } else {
    for(var i = 0, l = this.deltaFFT.length; i < l; i++) {
      d_ = fft[i] - this.prevFFT[i];
      this.deltaFFT[i] = d_ < 0 ? 0 : d_;
    }
  }
  this.prevFFT = new Uint8Array(fft);
}


VoiceAnalyzer.prototype.getDatas = function(){
  var buffTimeDomain = new Uint8Array(this.fftSize)
    , buffFrequency = new Uint8Array(this.fftSize / 2)
  setInterval(function(ev){
    this.analyzer.getByteTimeDomainData(buffTimeDomain);
    this.analyzer.getByteFrequencyData(buffFrequency);
    this.calcDeltaFFT(buffFrequency);
    var sum = this.getSum(buffTimeDomain);
    $("#sum").text(sum);
    drawPCM($("#pcm")[0], buffTimeDomain, "#00f");
    if(this.deltaFFT) {
      drawPCM($("#fft_delta")[0], this.deltaFFT, "#f00");
    }
    drawPCM($("#fft")[0], buffFrequency, "#f00");

    if(this.flagRecording) this.recordDatas(buffTimeDomain, buffFrequency, sum);
  }.bind(this), this.PRECISE_INTERVAL);
}

VoiceAnalyzer.prototype.getSum = function(datas){
  var sum = 0;
  for(var i = 0, l = datas.length; i < l; i++) {
    sum += Math.abs(datas[i] - 127);
  };
  return sum;
}




VoiceAnalyzer.prototype.recordDatas = function(pcm, fft, sum){
  var obj = {
    "pcm": pcm, 
    "fft": fft, 
    "fft_delta": new Uint8Array(this.deltaFFT), 
    "sum": sum, 
    "timestamp": new Date().toString()};
  this.recordedDatas.push(obj);
  this.appendGraph(obj);
}

VoiceAnalyzer.prototype.appendGraph = function(obj /* {"pcm", "fft", "sum", "fft_delta", "timestamp"} */) {
  var $div = $("<div>");
  var $sum = $("<p>").append($("<span>").text("sum : "+obj.sum));
  var $fft = $("<canvas>").attr("class", "fft");
  var $fft_delta = $("<canvas>").attr("class", "fft_delta");
  var $pcm = $("<canvas>").attr("class", "pcm");

  console.log(obj.sum);

  if(obj.sum > this.SUM_THRESH) {
    $fft.addClass("strong");
    $fft_delta.addClass("strong");
  }

  $div
    .append($sum)
    .append($fft)
    .append($fft_delta)
    .append($pcm)
    .appendTo("#recorded");

  drawPCM($fft[0], obj.fft, "#f00");
  drawPCM($fft_delta[0], obj.fft_delta, "#f00");
  drawPCM($pcm[0], obj.pcm, "#00f");
}



////////////////////////////////////////////////////////////////
//

var voiceAnalyzer;
$(function(){
  navigator.GetUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  voiceAnalyzer = new VoiceAnalyzer();


  navigator.GetUserMedia_({audio:true, video:false}, function(stream) {
    voiceAnalyzer.start(stream);
  }, function(err) {
    console.warn(err);
  });

  $("#btnRecord").on("click", function(){
    voiceAnalyzer.startRecording();
  });
});


