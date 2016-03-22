(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchEvent',
            'StopWatch/StopWatchException'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatchEvent'),
            require('StopWatchException')
        );
    } else {
        window.StopWatchSection = factory(
            window.PHPJS,
            window.StopWatchEvent,
            window.StopWatchException
        );
    }

}(window, function (PHPJS, StopWatchEvent, StopWatchException) {
    'use strict';

    /**
     * Stopwatch section.
     *
     * @param {number} origin Set the origin of the events in this section,
     * use null to set their origin to their start time.
     * @param {string} id Set the id of these section.
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchSection(origin,id) {
        this.origin = !isNaN(origin) ? origin : PHPJS.microtime(true) * 1000;
        this.id = !!id ? id : PHPJS.uniqid();

        /**
         * @type {StopWatchEvent[]}
         * @private
         */
        this.events = {};
    }

    /**
     * Returns the origin time.
     *
     * @returns {number}
     */
    StopWatchSection.prototype.getOrigin = function () {
        return this.origin;
    };

    /**
     * @return {string} The identifier of the section.
     */
    StopWatchSection.prototype.getId = function () {
        return this.id;
    };

    /**
     * Starts an event.
     *
     * @param {string} name The event name.
     * @param {string} category The event category.
     * @returns {StopWatchEvent} The StopWatchEvent.
     * @throws {StopWatchException} When the argument name is missing.
     */
    StopWatchSection.prototype.start = function (name, category) {
        if (!name) {
            throw new StopWatchException('Missing argument name,');
        }
        category = !!category ? category : 'default';
        if (!this.events[name]) {
            var start = !isNaN(this.origin) ? this.origin : (PHPJS.microtime(true) * 1000);
            this.events[name] = new StopWatchEvent(start, category)
        }
        return this.events[name].start();
    };

    /**
     * Stops an event.
     *
     * @param {string} name The event name.
     * @returns {StopWatchEvent} The event.
     * @throws {StopWatchException} When the argument name is missing.
     * @throws {StopWatchException} Wenn the event could not be found.
     */
    StopWatchSection.prototype.stop = function (name) {
        if (!name) {
            throw new StopWatchException('Missing argument name,');
        }
        if (!this.events[name]) {
            throw new StopWatchException(
                PHPJS.sprintf('Event "%s" is unknown.', name)
            );
        }
        return this.events[name].stop();
    };

    /**
     * Stops then restarts an event.
     *
     * @param {string} name The event name
     * @returns {StopWatchEvent} The event.
     * @throws {StopWatchException} When the argument name is missing.
     */
    StopWatchSection.prototype.lap = function (name) {
        if (!name) {
            throw new StopWatchException('Missing argument name,');
        }
        return this.stop(name).start();
    };

    /**
     * Returns the events from this section.
     *
     * @returns {StopWatchEvent[]} An array of StopWatchEvent instances.
     */
    StopWatchSection.prototype.getEvents = function () {
        return this.events;
    };

    StopWatchSection.prototype.addEventPeriod = function(name,category,start,end,memory) {
        category = !!category ? category : 'default';
        if (!this.events[name]) {
            var startOrigin = !isNaN(this.origin) ? this.origin : (PHPJS.microtime(true) * 1000);
            this.events[name] = new StopWatchEvent(startOrigin,category);
        }
        if (typeof(start)!=='undefined' && typeof(end)!=='undefined') {
            this.events[name].addPeriod(start,end,memory);
        }
        return this;
    };

    return StopWatchSection;

}));
