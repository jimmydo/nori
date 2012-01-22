var _ = require('underscore');
var events = require('events');
var util = require('util');

function ProcessSpy() {
    this.stdout = new events.EventEmitter();
    this.stderr = new events.EventEmitter();
}

util.inherits(ProcessSpy, events.EventEmitter);

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
