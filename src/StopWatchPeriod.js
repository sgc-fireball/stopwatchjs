(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define(factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory();
    } else {
        window.StopWatchPeriod = factory();
    }

}(window, function () {
    'use strict';

    var __globalWarning = false;

    /**
     * Represents an Period for an Event.
     *
     * @param {number} start The relative time of the start of the period (in milliseconds).
     * @param {number} end The relative time of the end of the period (in milliseconds).
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchPeriod(start, end, memory) {
        this.start = start || 0.0;
        this.end = end || 0.0;

        if (!!memory) {
            this.memory = memory;
        } else if (!!window.performance && !!window.performance.memory && !!window.performance.memory.usedJSHeapSize) {
            this.memory = window.performance.memory.usedJSHeapSize;
        } else {
            this.memory = 0;
        }
    }

    /**
     * Gets the relative time of the start of the period.
     *
     * @return {number} The time (in milliseconds).
     */
    StopWatchPeriod.prototype.getStartTime = function () {
        return this.start;
    };

    /**
     * Gets the relative time of the end of the period.
     *
     * @return {number} The time (in milliseconds).
     */
    StopWatchPeriod.prototype.getEndTime = function () {
        return this.end;
    };

    /**
     * Gets the time spent in this period.
     *
     * @return {number} The period duration (in milliseconds).
     */
    StopWatchPeriod.prototype.getDuration = function () {
        return this.end - this.start;
    };

    /**
     * Gets the memoty usage.
     *
     * @returns {number} The memory size (in bytes).
     */
    StopWatchPeriod.prototype.getMemory = function () {
        return this.memory;
    };

    return StopWatchPeriod;

}));
