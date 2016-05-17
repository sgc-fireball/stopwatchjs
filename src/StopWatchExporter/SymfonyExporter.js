(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/StopWatchExporter',
            'StopWatch/PHPJS'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('StopWatchExporter'),
            require('PHPJS')
        );
    } else {
        window.StopWatchSymfonyExporter = factory(
            window.StopWatchExporter,
            window.PHPJS
        );
    }

}(window, function (StopWatchExporter,PHPJS) {
    'use strict';

    /**
     * A helper to draw the StopWatch data.
     *
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function SymfonyExporter() {
        StopWatchExporter.call(this);
    }

    SymfonyExporter.prototype = new StopWatchExporter();

    SymfonyExporter.prototype.getExportData = function (options) {
        this.stopWatch.start('SymfonyExporter','internal');
        this.options = !!options ? options : {};
        this.options.timeLimit = !!this.options.timeLimit ? this.options.timeLimit : PHPJS.microtime(true);

        var index1, index2, data = {
            "max": 0,
            "requests": this._exportSections(this.stopWatch.getOrigin(), this.stopWatch.getSections()),
            "memory": this._exportMemory(this.stopWatch.getOrigin(),this.stopWatch.getMemoryStats())
        };

        for (index1 = 0; index1 < data.requests.length; index1++) {
            for (index2 in data.requests[index1].events) {
                if (!data.requests[index1].events.hasOwnProperty(index2)) {
                    continue;
                }
                if (data.max < data.requests[index1].events[index2].endtime) {
                    data.max = data.requests[index1].events[index2].endtime;
                }
            }
        }
        this.stopWatch.stop('SymfonyExporter','internal');
        return data;
    };

    SymfonyExporter.prototype._exportMemory = function (origin, memory) {
        var result = [],index;
        for (index in memory.logs) {
            if (!memory.logs.hasOwnProperty(index)) {
                continue;
            }
            result.push({
                time: memory.logs[index].time - origin,
                peak: memory.peak,
                total: memory.total,
                used: memory.logs[index].used
            });
        }
        return result;
    };

    SymfonyExporter.prototype._exportSections = function (origin, sections) {
        var result = [];
        for (var index in sections) {
            if (!sections.hasOwnProperty(index)) {
                continue;
            }
            var section = sections[index];
            var left = section.getOrigin() - origin;
            result.push({
                "id": section.getId(),
                "left": section.getOrigin() - origin,
                "events": this._exportEvents(origin, section.getEvents())
            });
        }
        return result;
    };

    SymfonyExporter.prototype._exportEvents = function (origin, events) {
        var result = [];
        for (var eventName in events) {
            if (!events.hasOwnProperty(eventName)) {
                continue;
            }
            var event = events[eventName];

            var now = PHPJS.microtime(true)*1000;
            var timeOffset = now - this.options.timeLimit*1000;
            if ( (origin+event.getEndTime()) < timeOffset ) {
                continue;
            }

            result.push({
                "name": eventName,
                "category": event.getCategory(),
                "origin": event.getOrigin(),
                "starttime": event.getStartTime(),
                "endtime": event.getEndTime(),
                "duration": event.getDuration(),
                "memory": event.getMemory(),
                "periods": this._exportPeriods(origin, event.getPeriods())
            });
        }
        return result;
    };

    SymfonyExporter.prototype._exportPeriods = function (origin, periods) {
        var result = [];
        for (var index = 0; index < periods.length; index++) {
            var period = periods[index];

            var now = PHPJS.microtime(true)*1000;
            var timeOffset = now - this.options.timeLimit*1000;
            if ( (origin+period.getEndTime()) < timeOffset ) {
                continue;
            }

            result.push({
                "start": period.getStartTime(),
                "end": period.getEndTime()
            });
        }
        return result;
    };

    return SymfonyExporter;

}));
