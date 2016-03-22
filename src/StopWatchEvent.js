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
        this.category = !!category ? category : 'default';

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
        return this.category;
    };

    /**
     * Gets all event periods.
     *
     * @return {StopWatchPeriod[]} An array of StopWatchPeriod instances.
     */
    StopWatchEvent.prototype.getPeriods = function () {
        var periods = [],index,now = this.getNow();
        for (index=0;index<this.periods.length;index++) {
            if (this.periods.hasOwnProperty(index)){
                periods.push(this.periods[index]);
            }
        }
        for (index=0;index<this.started.length;index++) {
            periods.push(new StopWatchPeriod(this.started[index], now));
        }
        return periods;
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
        if (!!this.periods[0]) {
            return this.periods[0].getStartTime();
        }
        if (!!this.started[0]) {
            return this.started[0];
        }
        return 0;
    };

    /**
     * Gets the relative time of the end of the last period.
     *
     * @return {number} The time (in milliseconds).
     */
    StopWatchEvent.prototype.getEndTime = function () {
        if (this.started.length) {
            return this.getNow();
        }
        var length = this.periods.length;
        return !!length ? this.periods[length - 1].getEndTime() : 0;
    };

    /**
     * Gets the duration of the events (including all periods).
     *
     * @return {number} The duration (in milliseconds).
     */
    StopWatchEvent.prototype.getDuration = function () {
        var _index,now = this.getNow(),_total = 0;
        for (_index=0;_index<this.periods.length;_index++) {
            _total += this.periods[_index].getDuration();
        }
        for (_index=0;_index<this.started.length;_index++) {
            _total += (new StopWatchPeriod(this.started[_index], now)).getDuration();
        }
        return _total;
    };

    /**
     * Gets the max memory usage of all periods.
     *
     * @return {number} The memory usage (in bytes)
     */
    StopWatchEvent.prototype.getMemory = function () {
        var _index,memory = 0;
        for (_index=0;_index<this.periods.length;_index++) {
            if (memory < this.periods[_index].getMemory()) {
                memory = this.periods[_index].getMemory();
            }
        }
        return memory;
    };

    /**
     * Return the current time relative to origin.
     *
     * @return {number} Time in ms.
     */
    StopWatchEvent.prototype.getNow = function () {
        return (PHPJS.microtime(true) * 1000) - this.origin;
    };

    StopWatchEvent.prototype.addPeriod = function(start,end,memory) {
        var period = new StopWatchPeriod(start-this.origin,end-this.origin,memory);
        this.periods.push( period );
        return this;
    };

    return StopWatchEvent;

}));
