(function (window, factory) {

    if (typeof(define) == 'function' && !!define.amd) {
        define([
            'StopWatch/PHPJS',
            'StopWatch/StopWatchViewer'
        ], factory);
    } else if (typeof(module) == 'object' && !!module.exports) {
        module.exports = factory(
            require('PHPJS'),
            require('SymfonyViewer')
        );
    } else {
        window.StopWatchSymfonyViewer = factory(
            window.PHPJS,
            window.StopWatchViewer
        );
    }

}(window, function (PHPJS, StopWatchViewer) {
    'use strict';

    function SymfonyViewer(parameters) {
        StopWatchViewer.call(this);

        parameters = parameters || {};

        this.id = PHPJS.uniqid('jsProfiler');
        this.container = null;
        this.renderData = {};

        this.parameters = {
            threshold: 0,
            space: 'auto',
            width: 'auto',
            colors: {
                'default': '#909090',
                'section': '#404040',
                'timer': '#66CC00',
                'interval': '#66CC00',
                'requests': '#FF6633',
                'worker': '#FFF200',
                'border': '#C0C0C0',
                'text': '#202020',
                'background': '#C0C0C0'
            }
        };
        for (var key in this.parameters) {
            if (!this.parameters.hasOwnProperty(key)) {
                continue;
            }
            if (!parameters[key]) {
                continue;
            }
            this.parameters[key] = parameters[key];
        }
        this._initSymfonyToolbar();
    }

    SymfonyViewer.prototype = new StopWatchViewer();

    SymfonyViewer.prototype._initSymfonyToolbar = function () {
        var toolbar = document.querySelector('div[id^="sfwdt"].sf-toolbar');
        if (!toolbar) {
            return this;
        }
        var self = this;
        var content = document.querySelector('div[id^="sfToolbarMainContent"]');
        if (!content) {
            setTimeout(function () {
                self._initSymfonyToolbar();
            }, 500);
            return this;
        }
        var allBlocks = document.querySelectorAll('div[id^="sfToolbarMainContent"] div.sf-toolbar-block');
        var lastBlock = allBlocks[allBlocks.length - 1];

        this.parameters.colors.background = '#222';

        var jsblock = document.createElement('div');
        jsblock.id = this.id + '-symfony-block';
        jsblock.className = 'sf-toolbar-block sf-toolbar-block-js sf-toolbar-status-normal ';
        jsblock.innerHTML = '<a href="#">' +
            '<div class="sf-toolbar-icon">' +
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="24" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">' +
            '<path fill="#AAAAAA" d="M15.1,4.3c-2.1-0.5-4.2-0.5-6.2,0C8.6,4.3,8.2,4.1,8.2,3.8V3.4c0-1.2,1-2.3,2.3-2.3h3c1.2,0,2.3,1,2.3,2.3 v0.3C15.8,4.1,15.4,4.3,15.1,4.3z M20.9,14c0,4.9-4,8.9-8.9,8.9s-8.9-4-8.9-8.9s4-8.9,8.9-8.9S20.9,9.1,20.9,14z M16.7,15 c0-0.6-0.4-1-1-1H13V8.4c0-0.6-0.4-1-1-1s-1,0.4-1,1v6.2c0,0.6,0.4,1.3,1,1.3h3.7C16.2,16,16.7,15.6,16.7,15z"></path>' +
            '</svg>' +
            '<span class="sf-toolbar-value">Javascript</span>' +
            '</div>' +
            '</a>' +
            '<div class="sf-toolbar-info" style="left: 0;">' +
            '<div class="sf-toolbar-info-piece">' +
            '<b>Status</b>' +
            '<span>running</span>' +
            '</div>' +
            '</div>';

        content.insertBefore(jsblock, lastBlock);
        jsblock.querySelector('a').addEventListener('click', function (e) {
            e.preventDefault();
            self.open();
            return false;
        });
        return this;
    };

    SymfonyViewer.prototype.open = function () {
        var self = this;

        if (!!this.container) {
            this.container.style.display = this.container.style.display == 'block' ? 'none' : 'block';
            if (this.container.style.display == 'block') {
                requestAnimationFrame(function () {
                    self._render();
                });
            }
            return;
        }

        var height = document.body.scrollHeight;
        height = height < document.body.clientHeight ? document.body.clientHeight : height;

        /**
         * create Container
         */
        this.container = document.createElement('div');
        this.container.id = this.id + '-container';
        this.container.style.display = 'block';
        this.container.style.position = 'absolute';
        this.container.style.top = 0;
        this.container.style.left = 0;
        this.container.style.width = '100%';
        this.container.style.minHeight = height + 'px';
        this.container.style.backgroundColor = this.parameters.colors.background;
        this.container.style.zIndex = 99998;
        this.container.style.overflow = 'hidden';
        this.container.style.padding = '10px';
        this.container.style.boxSizing = 'border-box';

        document.body.appendChild(this.container);

        requestAnimationFrame(function () {
            self._render();
        });
    };

    SymfonyViewer.prototype._render = function () {
        this.container.innerHTML = '<div style="overflow-x:auto;"></div>';
        this.renderData = this.stopWatchExporter.getExportData();

        if (this.parameters.width == 'auto') {
            this.parameters.width = this.container.querySelector('div').clientWidth - 1;
        }

        if (this.parameters.space == 'auto') {
            this.parameters.space = parseInt(this.parameters.width * 0.005);
            this.parameters.space = this.parameters.space < 3 ? 3 : this.parameters.space;
        }

        var ratio = (this.parameters.width - this.parameters.space * 2) / this.renderData.max;
        for (var index = 0; index < this.renderData.requests.length; index++) {
            this._renderRequest(ratio, this.renderData.requests[index]);
        }

        var self = this;
        requestAnimationFrame(function () {
            self._fixTextPosition();
        });
    };

    SymfonyViewer.prototype._fixTextPosition = function () {
        var svgs = this.container.querySelectorAll('svg');
        for (var index1 in svgs) {
            if (!svgs.hasOwnProperty(index1)) {
                continue;
            }
            var svg = svgs[index1];
            var texts = svg.querySelectorAll('text');
            for (var index2 in texts) {
                if (!texts.hasOwnProperty(index2)) {
                    continue;
                }
                var text = texts[index2];
                var svgWidth = parseInt(svg.getAttribute('width'));
                var realWidth = parseInt(text.getComputedTextLength());
                if ((svgWidth - this.parameters.space) < (parseInt(text.getAttribute('x')) + realWidth)) {
                    text.setAttribute('x', (svgWidth - realWidth - this.parameters.space).toString());
                }
            }
        }
    };

    SymfonyViewer.prototype._renderRequest = function (ratio, request) {

        var index, filteredEvents = {};
        for (index in request.events) {
            if (!request.events.hasOwnProperty(index)) {
                continue;
            }
            if (request.events[index].name == '__section__' || request.events[index].name == '__section__.child') {
                continue;
            }
            if (request.events[index].duration < this.parameters.threshold) {
                continue;
            }
            filteredEvents[index] = request.events[index];
        }

        var div = this.container.querySelector('div');
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var defs = document.createElementNS(svg.namespaceURI, 'defs');
        var pattern = document.createElementNS(svg.namespaceURI, 'pattern');
        pattern.setAttribute('id', 'bgStriped');
        pattern.setAttribute('x', '0');
        pattern.setAttribute('y', '38');
        pattern.setAttribute('width', '10');
        pattern.setAttribute('height', '10');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        var rect = document.createElementNS(svg.namespaceURI, 'rect');
        rect.setAttribute('width', '10');
        rect.setAttribute('height', '10');
        rect.setAttribute('fill', '#ffffff');
        pattern.appendChild(rect);
        var path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', 'M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2');
        path.setAttribute('stroke', '#CCC');
        path.setAttribute('stroke-width', '1');
        pattern.appendChild(path);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        svg.setAttribute('width', this.parameters.width.toString());
        svg.setAttribute('height', ((Object.keys(filteredEvents).length + 1) * 38).toString());
        rect = document.createElementNS(svg.namespaceURI, 'rect');
        rect.setAttribute('width', svg.getAttribute('width'));
        rect.setAttribute('height', svg.getAttribute('height'));
        rect.setAttribute('fill', '#ffffff');
        svg.appendChild(rect);
        svg.setAttribute('data-ratio', ratio);
        svg.setAttribute('data-offset', request.left);
        svg.style.display = 'block';
        svg.style.paddingBottom = '5px';

        var text = document.createElementNS(svg.namespaceURI, 'text');
        text.setAttribute('x', (this.parameters.space + 3).toString());
        text.setAttribute('y', 27);
        var tspan = document.createElementNS(svg.namespaceURI, 'tspan');
        tspan.setAttribute('style',
            'fill: ' + this.parameters.colors.text + ';' +
            'font-size: 24px; font-family: sans-serif;'
        );
        tspan.innerHTML = request.id == 'main' ? 'Main Request' : request.id;
        text.appendChild(tspan);
        svg.appendChild(text);

        this._drawBackground(svg, request.events);
        var keys = Object.keys(filteredEvents);
        for (index = 0; index < keys.length; index++) {
            this._renderEvent(svg, index, filteredEvents[keys[index]]);
        }
        div.appendChild(svg);
        this.container.appendChild(div);
    };

    SymfonyViewer.prototype._drawBackground = function (svg, events) {
        var index1, index2, rect, line, period, keys, color,
            ratio = parseFloat(svg.getAttribute('data-ratio')),
            offset = parseInt(svg.getAttribute('data-offset'));

        // draw vertical lines
        for (index1 in events) {
            if (!events.hasOwnProperty(index1)) {
                continue;
            }
            for (index2 = 0; index2 < events[index1].periods.length; index2++) {
                period = events[index1].periods[index2];
                if (events[index1].name == '__section__.child') {
                    rect = document.createElementNS(svg.namespaceURI, 'rect');
                    rect.setAttribute('x', (this.parameters.space + period.start * ratio).toString());
                    rect.setAttribute('y', '38');
                    rect.setAttribute('width', ((period.end - period.start) * ratio).toString());
                    rect.setAttribute('height', (parseInt(svg.getAttribute('height')) - 38).toString());
                    rect.setAttribute('fill', 'url(#bgStriped)');
                    svg.appendChild(rect);
                } else if (events[index1].category == 'section' || events[index1].name == '__section__') {
                    line = document.createElementNS(svg.namespaceURI, 'line');
                    line.setAttribute('x1', (this.parameters.space + (offset + period.start) * ratio).toString());
                    line.setAttribute('x2', line.getAttribute('x1'));
                    line.setAttribute('y1', '38');
                    line.setAttribute('y2', svg.getAttribute('height'));
                    line.setAttribute('style', 'stroke:' + this.parameters.colors.border + ';stroke-width:1;');
                    svg.appendChild(line);
                    line = document.createElementNS(svg.namespaceURI, 'line');
                    line.setAttribute('x1', (this.parameters.space + (offset + period.end) * ratio).toString());
                    line.setAttribute('x2', line.getAttribute('x1'));
                    line.setAttribute('y1', '38');
                    line.setAttribute('y2', svg.getAttribute('height'));
                    line.setAttribute('style', 'stroke:' + this.parameters.colors.border + ';stroke-width:1;');
                    svg.appendChild(line);
                }
            }
        }

        // draw horizontal lines
        keys = Object.keys(events);
        for (index1 = 0; index1 < keys.length; index1++) {
            color = this.parameters.colors.border;
            if (index1 == 0) {
                color = this.parameters.colors.text;
            }
            line = document.createElementNS(svg.namespaceURI, 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('x2', svg.getAttribute('width'));
            line.setAttribute('y1', (38 * (index1 + 1)).toString());
            line.setAttribute('y2', line.getAttribute('y1'));
            line.setAttribute('style', 'stroke:' + color + ';stroke-width:1;');
            svg.appendChild(line);
        }
    };

    SymfonyViewer.prototype._renderEvent = function (svg, line, event) {
        var x, y, text, tspan, rect, index, width, height, period, realWidth, path,
            ratio = parseFloat(svg.getAttribute('data-ratio')),
            offset = parseInt(svg.getAttribute('data-offset')),
            offsetY = (line + 1) * 38,
            color = this.parameters.colors.default;

        if (!!this.parameters.colors[event.name]) {
            color = this.parameters.colors[event.name];
        } else if (!!this.parameters.colors[event.category]) {
            color = this.parameters.colors[event.category];
        }

        // draw event text
        x = parseInt(this.parameters.space + (offset + event.starttime) * ratio + 3);
        y = parseInt(offsetY + 16);
        text = document.createElementNS(svg.namespaceURI, 'text');
        text.setAttribute('x', x.toString());
        text.setAttribute('y', y.toString());

        tspan = document.createElementNS(svg.namespaceURI, 'tspan');
        tspan.setAttribute('style',
            'fill: ' + this.parameters.colors.text + ';' +
            'font-size: 12px; font-family: sans-serif;'
        );
        tspan.innerHTML = event.name + ' ' + event.duration.toString() + ' ms.';
        text.appendChild(tspan);
        svg.appendChild(text);

        // draw event blocks
        for (index = 0; index < event.periods.length; index++) {
            period = event.periods[index];

            x = parseInt(this.parameters.space + (offset + period.start) * ratio);
            width = parseInt((period.end - period.start) * ratio);
            width = width < 2 ? 2 : width;

            y = offsetY + 19;
            height = parseInt(this.parameters.lineHeight / 2 - 4);

            if (event.category != 'section') {
                // start marker
                rect = document.createElementNS(svg.namespaceURI, 'rect');
                rect.setAttribute('x', x.toString());
                rect.setAttribute('y', y.toString());
                rect.setAttribute('width', '1');
                rect.setAttribute('height', '12');
                rect.setAttribute('fill', color);
                svg.appendChild(rect);
            } else {
                // arrow left
                path = document.createElementNS(svg.namespaceURI, 'path');
                path.setAttribute('fill', color);
                path.setAttribute('d', 'M' + x.toString() + ',' + y.toString() + ' l0,12 l8,-12');
                svg.appendChild(path);

                // arrow right
                path = document.createElementNS(svg.namespaceURI, 'path');
                path.setAttribute('fill', color);
                path.setAttribute('d', 'M' + (x + width).toString() + ',' + y.toString() + ' l0,12 l-8,-12');
                svg.appendChild(path);
            }
            // timeline
            rect = document.createElementNS(svg.namespaceURI, 'rect');
            rect.setAttribute('x', x.toString());
            rect.setAttribute('y', y.toString());
            rect.setAttribute('width', width.toString());
            rect.setAttribute('height', '3');
            rect.setAttribute('fill', color);
            svg.appendChild(rect);
        }
    };

    return SymfonyViewer;

}));
