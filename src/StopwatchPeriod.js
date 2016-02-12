define(function () {
    "use strict";

    if (!!window.StopWatchPeriod) {
        return window.StopWatchPeriod;
    }

    /**
     * Represents an Period for an Event.
     *
     * @param {number} start The relative time of the start of the period (in milliseconds).
     * @param {number} end The relative time of the end of the period (in milliseconds).
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchPeriod(start, end) {
        this.start = start || 0.0;
        this.end = end || 0.0;
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

    window.StopWatchPeriod = StopWatchPeriod;
    return window.StopWatchPeriod;

});
