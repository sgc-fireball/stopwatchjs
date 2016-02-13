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
        }
        self.close();
    }
});

interval = setInterval(function(){
    if (firstTime) {
        firstTime = false;
        self.postMessage({'cmd':'start','event':'working','category':'worker'});
    } else {
        self.postMessage({'cmd':'lap','event':'working'});
    }
},100);
self.postMessage({'cmd':'stop','event':'setup'});
