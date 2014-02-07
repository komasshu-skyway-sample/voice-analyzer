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
};

VoiceAnalyzer.prototype.start = function(stream){
  console.log(this);
  this.mediastreamsource = this.audioContext.createMediaStreamSource(stream);
  console.dir(this.mediastreamsource);
  this.mediastreamsource.connect(this.analyzer);
  this.fftSize = this.analyzer.fftSize

  this.getDatas();
  // this.analyzer.connect(this.audioContext.destination);
}

VoiceAnalyzer.prototype.getDatas = function(){
  var buffTimeDomain = new Uint8Array(this.fftSize)
    , buffFrequency = new Uint8Array(this.fftSize)
  setInterval(function(ev){
    this.analyzer.getByteTimeDomainData(buffTimeDomain);
    this.analyzer.getByteFrequencyData(buffFrequency);
    drawPCM($("#pcm")[0], buffTimeDomain, "#00f");
    drawPCM($("#fft")[0], buffFrequency, "#f00");
  }.bind(this), 30);
}



////////////////////////////////////////////////////////////////
//

navigator.GetUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var voiceAnalyzer = new VoiceAnalyzer();


navigator.GetUserMedia_({audio:true, video:false}, function(stream) {
  voiceAnalyzer.start(stream);
}, function(err) {
  console.warn(err);
});


