define(function () {
    "use strict";

    if (!!window.StopWatchException) {
        return window.StopWatchException;
    }

    /**
     * Represents a StopWatch error.
     *
     * @param {string} errmsg The error message.
     * @param {number} errno The error code.
     * @constructor
     * @author Richard Hülsberg <rh@hrdns.de>
     * @see https://github.com/symfony/stopwatch
     */
    function StopWatchException(errmsg, errno) {
        this._errmsg = !!errmsg ? errmsg : 'Unknown StopWatchException.';
        this._errno = !!errno ? errno : 0;
    }

    /**
     * Get the error message.
     *
     * @return {string}
     */
    StopWatchException.prototype.getMessage = function () {
        return this._errmsg;
    };

    /**
     * Get the error code.
     *
     * @return {number}
     */
    StopWatchException.prototype.getCode = function () {
        return this._errno;
    };

    /**
     * @return {string}
     */
    StopWatchException.prototype.toString = function () {
        return 'StopWatchException[' + this.getCode() + '] ' + this.getMessage();
    };

    window.StopWatchException = StopWatchException;
    return window.StopWatchException;

});