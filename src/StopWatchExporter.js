(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatch',
            'StopWatch/StopWatchViewer'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('StopWatch'),
            require('StopWatchViewer')
        );
    } else {
        window.StopWatchExporter = factory(
            window.PHPJS,
            window.StopWatch,
            window.StopWatchViewer
        );
    }

}(window, function (PHPJS, StopWatch, StopWatchViewer) {
    'use strict';

    /**
     * A helper to draw the StopWatch data.
     *
     * @param {StopWatch} stopWatch A StopWatch instant to draw.
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchExporter(stopWatch) {
        this.stopWatch = stopWatch;
        this.viewer = new StopWatchViewer({
            stopWatchExporter: this
        });
    }

    StopWatchExporter.prototype.getStopWatch = function () {
        return this.stopWatch;
    };

    StopWatchExporter.prototype.getViewer = function () {
        return this.viewer;
    };

    StopWatchExporter.prototype.getExportData = function () {
        var index1, index2, data = {
            "max": 0,
            "requests": this._exportSections(this.stopWatch.getOrigin(), this.stopWatch.getSections())
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
        return data;
    };

    StopWatchExporter.prototype._exportSections = function (origin, sections) {
        var result = [];
        for (var index in sections) {
            if (!sections.hasOwnProperty(index)) {
                continue;
            }
            var section = sections[index];
            result.push({
                "id": section.getId(),
                "left": section.getOrigin() - origin,
                "events": this._exportEvents(origin, section.getEvents())
            });
        }
        return result;
    };

    StopWatchExporter.prototype._exportEvents = function (origin, events) {
        var result = [];
        for (var eventName in events) {
            if (!events.hasOwnProperty(eventName)) {
                continue;
            }
            var event = events[eventName];
            result.push({
                "name": eventName,
                "category": event.getCategory(),
                "origin": event.getOrigin(),
                "starttime": event.getStartTime(),
                "endtime": event.getEndTime(),
                "duration": event.getDuration(),
                "periods": this._exportPeriods(origin, event.getPeriods())
            });
        }
        return result;
    };

    StopWatchExporter.prototype._exportPeriods = function (origin, periods) {
        var result = [];
        for (var index = 0; index < periods.length; index++) {
            var period = periods[index];
            result.push({
                "start": period.getStartTime(),
                "end": period.getEndTime()
            });
        }
        return result;
    };

    return StopWatchExporter;

}));
