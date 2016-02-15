(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchException'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatchException')
        );
    } else {
        window.StopWatchViewer = factory(
            window.PHPJS,
            window.StopWatchException
        );
    }

}(window, function (PHPJS) {
    'use strict';

    function StopWatchViewer() {
        this.stopWatchExporter = null;
    }

    StopWatchViewer.prototype.setStopWatchExporter = function (StopWatchExporter) {
        this.stopWatchExporter = StopWatchExporter;
        return this;
    };

    StopWatchViewer.prototype.open = function () {
        throw new StopWatchException('Abstract method open of StopWatchViewer.');
    };

    return StopWatchViewer;

}));
