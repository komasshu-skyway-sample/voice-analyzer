

////////////////////////////////////////////////////////////////
//

var voiceAnalyzer, classifier;


$(function(){
  navigator.GetUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  // make instance
  voiceAnalyzer = new VoiceAnalyzer();
  classifier = new Classifier();


  navigator.GetUserMedia_({audio:true, video:false}, function(stream) {
    voiceAnalyzer.start(stream);
  }, function(err) {
    console.warn(err);
  });

  $("#btnRecord").on("click", function(){
    voiceAnalyzer.startRecording();
  });

  $("#strong-only").on("click", function(){
    if($(this)[0].checked) $(".weak").hide();
    else $(".weak").show();
  });

  $("form.learn").on("submit", function(ev) {
    ev.preventDefault();
    var name = $(this).find("input#c-name").val();
    var datas = [], labels = [];

    $("input.learn:checked").each(function(ev){
      var id = $(this).data("id")  | 0;
      var label = $(this).val() | 0;
      var data = [];
      console.log(id);
      for(var i = 0, l = voiceAnalyzer.recordedDatas[id].fft_delta.length; i < l; i++) {
        data.push(voiceAnalyzer.recordedDatas[id].fft_delta[i] / 255);
      }
      datas.push(data);
      labels.push(label);
    });
    console.log(name, datas, labels);

    classifier.learn(name, datas, labels);
  });

  $(window).on("clicked", function(ev, obj) {
    console.log(obj);
    var data = [];
    for(var i = 0, l = obj.data.fft_delta.length; i < l; i++) {
      data.push(obj.data.fft_delta[i] / 255);
    }
    console.log(data);
    console.log(classifier.predict(data));
  });

  $(window).on("fft_delta", function(ev, data) {
    var d = [];
    for(var i = 0, l = data.length; i < l; i++) {
      d.push(data[i] / 255);
    }
    var predict = classifier.predict(d);
    if(predict.clap > 0) {
      console.dir(JSON.stringify(predict));
      console.log("CLAP!!");
    }

    if(predict.whistle > 0) {
      console.log("WHILSTLE!!");
    }
  });
});


