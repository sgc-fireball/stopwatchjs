(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchEvent',
            'StopWatch/StopWatchException',
            'StopWatch/StopWatchSection'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatchEvent'),
            require('StopWatchException'),
            require('StopWatchSection')
        );
    } else {
        window.StopWatch = factory(
            window.PHPJS,
            window.StopWatchEvent,
            window.StopWatchException,
            window.StopWatchSection
        );
    }

}(window, function (PHPJS, StopWatchEvent, StopWatchException, StopWatchSection) {
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
         * @type {StopWatchSection[]}
         * @private
         */
        this.sections = {'main': new StopWatchSection(undefined, 'main')};

        /**
         * @see https://www.w3.org/TR/navigation-timing/timing-overview.png
         */
        this.sections = {'main': new StopWatchSection(window.performance.timing.domainLookupStart, 'main')};
        this.sections['main'].addEventPeriod('System','section');
        var self = this;
        var interval = setInterval(function(){
            if (!window.performance.timing.loadEventEnd) {
                return;
            }
            self.sections['main'].addEventPeriod(
                '__section__.child',
                'system',
                window.performance.timing.domainLookupStart,
                window.performance.timing.loadEventEnd
            );
            self.sections['main'].addEventPeriod(
                '__section__',
                'system',
                window.performance.timing.domainLookupStart,
                window.performance.timing.loadEventEnd
            );
            self.sections['main'].addEventPeriod(
                'System',
                'section',
                window.performance.timing.domainLookupStart,
                window.performance.timing.loadEventEnd
            );
            clearInterval(interval);
        });
    }

    /**
     * Return the start time.
     *
     * @returns {number} Return the start time.
     */
    StopWatch.prototype.getOrigin = function () {
        return this.sections['main'].getOrigin();
    };

    /**
     * Returns all sections.
     *
     * @return {StopWatchSection[]}
     */
    StopWatch.prototype.getSections = function () {
        return this.sections;
    };

    /**
     * Creates a new section or re-opens an existing section.
     * The id parameter is used to retrieve the section or to create a new one.
     *
     * @see getSectionEvents()
     * @param {string|null} id The id of the session to re-open, null to create a new one
     * @return {StopWatchSection} A StopWatchSection instance.
     * @throws {StopWatchException} When argument id is missing.
     */
    StopWatch.prototype.openSection = function (id) {
        if (!id) {
            throw new StopWatchException('Missing argument id.');
        }
        this.sections['main'].start('__section__.child', 'section');
        this.sections[id] = !!this.sections[id] ? this.sections[id] : new StopWatchSection(PHPJS.microtime(true) * 1000, id);
        this.sections[id].start('__section__', 'default');
        return this.sections[id];
    };

    /**
     * Stops a section.
     * The id parameter is used to retrieve the section.
     *
     * @see getSectionEvents()
     * @param {string|StopWatchSection} id The identifier of the section.
     * @return {StopWatch} The StopWatch instance.
     * @throws {StopWatchException} When argument id is missing.
     * @throws {StopWatchException} When the section could not be found.
     */
    StopWatch.prototype.closeSection = function (id) {
        if (!id) {
            throw new StopWatchException('Missing argument id.');
        }
        id = id instanceof StopWatchSection ? id.getId() : id;
        if (!this.sections[id]) {
            throw new StopWatchException(
                PHPJS.sprintf('Section "%s" is unknown.', id)
            );
        }
        this.sections[id].stop('__section__');
        this.sections['main'].stop('__section__.child');
        return this;
    };

    /**
     * Start an event.
     *
     * @param {string} name The event name.
     * @param {string} category The event category.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     * @throws {StopWatchException} When argument name is missing.
     */
    StopWatch.prototype.start = function (name, category) {
        if (!name) {
            throw new StopWatchException('Missing argument name.');
        }
        category = !!category ? category : 'default';
        return this.sections['main'].start(name, category);
    };

    /**
     * Restart an event.
     *
     * @param {string} name The event name.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     * @throws {StopWatchException} When argument name is missing.
     */
    StopWatch.prototype.lap = function (name) {
        if (!name) {
            throw new StopWatchException('Missing argument name.');
        }
        return this.sections['main'].stop(name).start();
    };

    /**
     * Stops an event.
     *
     * @param {string} name The event name.
     * @return {StopWatchEvent|null} A StopWatchEvent instance.
     */
    StopWatch.prototype.stop = function (name) {
        if (!name) {
            throw new StopWatchException('Missing argument name.');
        }
        return this.sections['main'].stop(name);
    };

    return new StopWatch();

}));
