(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchException',
            'StopWatch/StopWatchPeriod'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatchException'),
            require('StopWatchPeriod')
        );
    } else {
        window.StopWatchEvent = factory(
            window.PHPJS,
            window.StopWatchException,
            window.StopWatchPeriod
        );
    }

}(window, function (PHPJS, StopWatchException, StopWatchPeriod) {
    'use strict';

    /**
     * Represents an Event managed by StopWatch.
     *
     * @param origin
     * @param category
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchEvent(origin, category) {
        this.origin = origin;
        this.categpry = !!category ? category : 'default';

        /**
         * @type {StopWatchPeriod[]}
         */
        this.periods = [];

        /**
         * @type {number[]}
         */
        this.started = [];
    }

    /**
     * Gets the origin.
     *
     * @return {number} The origin in milliseconds
     */
    StopWatchEvent.prototype.getOrigin = function () {
        return this.origin;
    };

    /**
     * Gets the category.
     *
     * @return {string} The category
     */
    StopWatchEvent.prototype.getCategory = function () {
        return this.categpry;
    };

    /**
     * Gets all event periods.
     *
     * @return {StopWatchPeriod[]} An array of StopWatchPeriod instances.
     */
    StopWatchEvent.prototype.getPeriods = function () {
        return this.periods;
    };


    /**
     * Starts a new event period.
     *
     * @return {StopWatchEvent} The event.
     */
    StopWatchEvent.prototype.start = function () {
        this.started.push(this.getNow());
        return this;
    };

    /**
     * Stops the current period and then starts a new one.
     *
     * @return {StopWatchEvent} The event.
     */
    StopWatchEvent.prototype.lap = function () {
        return this.stop().start();
    };

    /**
     * Stops the last started event period.
     *
     * @return {StopWatchEvent} The Event.
     * @throws {StopWatchException} When start wasn't called before stopping
     * @throws {StopWatchException} When stop() is called without a matching call to start().
     */
    StopWatchEvent.prototype.stop = function () {
        if (!this.started.length) {
            throw new StopWatchException('stop() called but start() has not been called before.');
        }
        this.periods.push(new StopWatchPeriod(this.started.pop(), this.getNow()));
        return this;
    };

    /**
     * Gets the relative time of the start of the first period.
     *
     * @return {number} The time (in milliseconds).
     */
    StopWatchEvent.prototype.getStartTime = function () {
        return !!this.periods[0] ? this.periods[0].getStartTime() : 0;
    };

    /**
     * Gets the relative time of the end of the last period.
     *
     * @return {number} The time (in milliseconds).
     */
    StopWatchEvent.prototype.getEndTime = function () {
        var length = this.periods.length;
        return !!length ? this.periods[length - 1].getEndTime() : 0;
    };

    /**
     * Gets the duration of the events (including all periods).
     *
     * @return {number} The duration (in milliseconds).
     */
    StopWatchEvent.prototype.getDuration = function () {
        var _index = 0;
        var periods = this.periods;
        var _stopped = periods.length;
        var _left = this.started.length - _stopped;
        for (var i = 0; i < _left; i++) {
            _index = _stopped + i;
            periods.push(new StopWatchPeriod(this.started[_index], this.getNow()));
        }
        var _total = 0;
        for (_index=0;_index<periods.length;_index++) {
            _total += periods[_index].getDuration();
        }
        return _total;
    };

    /**
     * Return the current time relative to origin.
     *
     * @return {number} Time in ms.
     */
    StopWatchEvent.prototype.getNow = function () {
        return (PHPJS.microtime(true) * 1000) - this.origin;
    };

    /**
     * @return {string}
     */
    StopWatchEvent.prototype.toString = function () {
        return PHPJS.sprintf(
            '%s: %d ms',
            this.getCategory(),
            this.getDuration()
        );
    };

    return StopWatchEvent;

}));
