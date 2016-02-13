(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchEvent',
            'StopWatch/StopWatchException',
            'StopWatch/StopWatchSection',
            'StopWatch/StopWatchExporter'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatchEvent'),
            require('StopWatchException'),
            require('StopWatchSection'),
            require('StopWatchExporter')
        );
    } else {
        window.StopWatch = factory(
            window.PHPJS,
            window.StopWatchEvent,
            window.StopWatchException,
            window.StopWatchSection,
            window.StopWatchExporter
        );
    }

}(window, function (PHPJS, StopWatchEvent, StopWatchException, StopWatchSection, StopWatchExporter) {
    'use strict';

    /**
     * StopWatch provides a way to profile code.
     *
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatch() {

        /**
         * @type {number}
         */
        this.origin = PHPJS.microtime(true) * 1000;

        /**
         * @type {StopWatchSection[]}
         * @private
         */
        var section = new StopWatchSection(this.origin);
        section.setId('main');
        this.activeSections = [section];

        /**
         * @type {StopWatchSection[]}
         * @private
         */
        this.sections = {'root': section};

        this.exporter = new StopWatchExporter(this);
    }

    /**
     * @return {StopWatchSection[]}
     */
    StopWatch.prototype.getSections = function () {
        return this.sections;
    };

    /**
     * Creates a new section or re-opens an existing section.
     *
     * @see getSectionEvents()
     * @param {string|null} id The id of the session to re-open, null to create a new one
     * @return {StopWatchSection} A StopWatchSection instance.
     * @throws {StopWatchException} When the section to re-open is not reachable.
     */
    StopWatch.prototype.openSection = function (id) {

        id = !!id ? id : null;
        var current = this.activeSections[this.activeSections.length - 1];

        if (!!id && !current.get(id)) {
            throw new StopWatchException(
                PHPJS.sprintf('The section "%s" has been started at an other level and can not be opened.', id)
            );
        }

        this.start('__section__.child', 'section');
        var section = current.open(id);
        this.activeSections.push(section);
        this.start('__section__');
        return section;
    };

    /**
     * Stops the last started section.
     * The id parameter is used to retrieve the events from this section.
     *
     * @see getSectionEvents()
     * @param {string} id The identifier of the section.
     * @return {StopWatch} The StopWatch instance.
     * @throws {StopWatchException} When there's no started section to be stopped.
     */
    StopWatch.prototype.stopSection = function (id) {
        if (this.activeSections.length == 1) {
            throw new StopWatchException('There is no started section to stop.');
        }
        this.stop('__section__');
        var section = this.activeSections.pop();
        this.sections[id] = section.setId(id);
        this.stop('__section__.child');
        return this;
    };

    /**
     * @param {string} name The event name.
     * @param {string} category The event category.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     */
    StopWatch.prototype.start = function (name, category) {
        category = !!category ? category : '';
        return this.activeSections[this.activeSections.length - 1].start(name, category);
    };

    /**
     * Checks if the event was started.
     *
     * @param {string} name The event name.
     * @return {boolean}
     */
    StopWatch.prototype.isStarted = function (name) {
        return this.activeSections[this.activeSections.length - 1].isEventStarted(name);
    };

    /**
     * Stops an event.
     *
     * @param {string} name The event name.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     */
    StopWatch.prototype.stop = function (name) {
        return this.activeSections[this.activeSections.length - 1].stop(name);
    };

    /**
     * Stops then restarts an event.
     *
     * @param {string} name The event name.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     */
    StopWatch.prototype.lap = function (name) {
        if (!this.activeSections.length) {
            return null;
        }
        var section = this.activeSections[this.activeSections.length - 1];
        return section.stop(name).start();
    };

    /**
     * Returns a specific event by name.
     *
     * @param {string} name The event name.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     */
    StopWatch.prototype.getEvent = function (name) {
        if (!this.activeSections.length) {
            return null;
        }
        var section = this.activeSections[this.activeSections.length - 1];
        return section.getEvent(name);
    };

    /**
     * Gets all events for a given section.
     *
     * @param {string} id A section identifier.
     * @return {StopWatchEvent[]} An array of StopWatchEvent instances.
     */
    StopWatch.prototype.getSectionEvents = function (id) {
        return !!this.sections[id] ? this.sections[id].getEvents() : [];
    };

    StopWatch.prototype.getOrigin = function () {
        return this.origin;
    };

    StopWatch.prototype.getExporter = function () {
        return this.exporter;
    };

    return new StopWatch();

}));
