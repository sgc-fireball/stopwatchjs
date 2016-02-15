(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/StopWatchException'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('StopWatchException')
        );
    } else {
        window.StopWatchExporter = factory(
            window.StopWatchException
        );
    }

}(window, function (StopWatchException) {
    'use strict';

    /**
     * Abstract StopWatchExporter
     *
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchExporter() {
        this.stopWatch = null;
    }

    StopWatchExporter.prototype.setStopWatch = function (StopWatch) {
        this.stopWatch = StopWatch;
        return this;
    };

    StopWatchExporter.prototype.getExportData = function () {
        throw new StopWatchException('Abstract method getExportData of StopWatchExporter.');
    };

    return StopWatchExporter;

}));
