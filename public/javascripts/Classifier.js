/* Classifier.js */

var Classifier, Classifier_;

var clap_data = JSON.parse(clap);
var whistle_data = JSON.parse(whistle);

(function(){
  Classifier = function(){
    this.class = {};
    this.class.clap = new Classifier_('clap');
    this.class.clap.fromJSON(clap_data);
    this.class.whistle = new Classifier_('whistle');
    this.class.whistle.fromJSON(whistle_data);
  };

  Classifier.prototype.add_ = function(name) {
    if(!this.class.hasOwnProperty(name)) {
      this.class[name] = new Classifier_(name);
    }
  }
  Classifier.prototype.learn = function(name, data, labels) {
    this.add_(name);

    this.class[name].learn(data, labels);
  }
  Classifier.prototype.predict = function(data) {
    var ret = {};
    for(var key in this.class){
      ret[key] = this.class[key].marginOne(data);
    }
    return ret;
  }


  ///////////////////////////////////////////////////
  //
  Classifier_ = function(name){
    this.label = name;
    this.svm = new svmjs.SVM();
  }

  Classifier_.prototype.fromJSON = function(json) {
    this.svm.fromJSON(json);
  }

  Classifier_.prototype.learn = function(data, labels){
    this.svm.train(data, labels, {'kernel': "linear", "C": 1.0});
  }

  Classifier_.prototype.marginOne = function(data) {
    return this.svm.marginOne(data);
  }
}());
