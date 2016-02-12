define([
    "StopWatch/PHPJS",
    "StopWatch/StopWatchEvent",
    "StopWatch/StopWatchException"
], function (PHPJS, StopWatchEvent, StopWatchException) {
    "use strict";

    if (!!window.StopWatchSection) {
        return window.StopWatchSection;
    }

    /**
     * Stopwatch section.
     *
     * @param {number} origin Set the origin of the events in this section,
     * use null to set their origin to their start time.
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchSection(origin) {
        this.origin = !isNaN(origin) ? origin : null;

        /**
         * @type {StopWatchEvent[]}
         * @private
         */
        this.events = {};

        /**
         * @type {string}
         * @private
         */
        this.id = PHPJS.uniqid();

        /**
         * @type {StopWatchSection[]}
         * @private
         */
        this.children = [];
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
     * Returns the child section.
     *
     * @param {string} id The child section identifier.
     * @return {StopWatchSection|null} The child section or null when none found.
     */
    StopWatchSection.prototype.get = function (id) {
        for (var index in this.children) {
            if (this.children.hasOwnProperty(index) && this.children[index].getId() == id) {
                return this.children[index];
            }
        }
        return null;
    };

    /**
     * Creates or re-opens a child section.
     *
     * @param {string|null} id null to create a new section, the identifier to re-open an existing one.
     * @return {StopWatchSection} A child section
     */
    StopWatchSection.prototype.open = function (id) {
        var session = this.get(id);
        if (!session) {
            session = new StopWatchSection(PHPJS.microtime(true) * 1000);
            this.children.push(session);
        }
        return session;
    };

    /**
     * @return {string} The identifier of the section.
     */
    StopWatchSection.prototype.getId = function () {
        return this.id;
    };

    /**
     * Sets the session identifier.
     *
     * @param {string} id The session identifier.
     * @return {StopWatchSection} A StopWatchSection instance.
     */
    StopWatchSection.prototype.setId = function (id) {
        if (!!id) {
            this.id = id;
        }
        return this;
    };

    /**
     * Starts an event.
     *
     * @param {string} name The event name.
     * @param {string} category The event category.
     * @returns {StopWatchEvent} The StopWatchEvent.
     */
    StopWatchSection.prototype.start = function (name, category) {
        if (!this.events[name]) {
            var start = !isNaN(this.origin) ? this.origin : (PHPJS.microtime(true) * 1000);
            this.events[name] = new StopWatchEvent(start, category)
        }
        return this.events[name].start();
    };

    /**
     * Checks if the event was started.
     *
     * @param {string} name The event name
     * @returns {boolean}
     */
    StopWatchSection.prototype.isEventStarted = function (name) {
        return !!this.events[name] && this.events[name].isStarted();
    };

    /**
     * Stops an event.
     *
     * @param {string} name The event name.
     * @returns {StopWatchEvent} The event.
     * @throws {StopWatchException} When the event has not been started.
     */
    StopWatchSection.prototype.stop = function (name) {
        if (!this.events[name]) {
            throw new StopWatchException(
                PHPJS.sprintf('Event "%s" is not known.', name)
            );
        }
        return this.events[name].stop();
    };

    /**
     * Stops then restarts an event.
     *
     * @param {string} name The event name
     * @returns {StopWatchEvent} The event.
     */
    StopWatchSection.prototype.lap = function (name) {
        return this.stop(name).start();
    };

    /**
     * Returns a specific event by name.
     *
     * @param {string} name The event name.
     * @returns {StopWatchEvent} The event
     * @throws {StopWatchException} When the event is not known.
     */
    StopWatchSection.prototype.getEvent = function (name) {
        if (!this.events[name]) {
            throw new StopWatchException(
                PHPJS.sprintf('Event "%s" is not known.', name)
            );
        }
        return this.events[name];
    };

    /**
     * Returns the events from this section.
     *
     * @returns {StopWatchEvent[]} An array of StopWatchEvent instances.
     */
    StopWatchSection.prototype.getEvents = function () {
        return this.events;
    };

    window.StopWatchSection = StopWatchSection;
    return window.StopWatchSection;

});
