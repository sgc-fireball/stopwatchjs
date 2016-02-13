self.postMessage({'cmd':'start','event':'setup','category':'worker'});
var firstTime = true;
var interval = null;

self.addEventListener('message', function(e) {
    var data = e.data;
    if (data.cmd=='stop') {
        if (!!interval) {
            clearInterval(interval);
            interval = null;
        }
        if (!firstTime) {
            self.postMessage({'cmd':'stop','event':'working'});
            self.postMessage({'cmd':'stop','event':'watcher'});
        }
        self.close();
    }
});

interval = setInterval(function(){
    if (firstTime) {
        firstTime = false;
        self.postMessage({'cmd':'start','event':'watcher','category':'interval'});
    } else {
        self.postMessage({'cmd':'lap','event':'watcher'});
    }
},100);
setTimeout(function(){
    self.postMessage({'cmd':'start','event':'subwork','category':'timeout'});
    setTimeout(function(){
        self.postMessage({'cmd':'stop','event':'subwork'});
    },50);
},200);
self.postMessage({'cmd':'stop','event':'setup'});
self.postMessage({'cmd':'start','event':'working','category':'worker'});