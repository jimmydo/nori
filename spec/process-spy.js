var events = require('events');
var _ = require('underscore');

function ProcessSpy() {
    this.stdout = new events.EventEmitter();
    this.stderr = new events.EventEmitter();
}

ProcessSpy.prototype = new events.EventEmitter();

_.extend(ProcessSpy.prototype, {

    exit: function (code) {
        this.emit('exit', code || 0);
    },
    sendStdOut: function (data) {
        this.stdout.emit('data', data);
    },
    sendStdErr: function (data) {
        this.stderr.emit('data', data);
    }
});

module.exports = ProcessSpy;
