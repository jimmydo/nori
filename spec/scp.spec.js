var _ = require('underscore');
var childProcess = require('child_process');
var events = require('events');
var nori = require('..');
var scpModule = require('../lib/scp');

describe('scp', function () {

    var spyProcess = new events.EventEmitter();
    _.extend(spyProcess, {
        stdout: new events.EventEmitter(),
        stderr: new events.EventEmitter(),
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

    beforeEach(function () {
        spyOn(scpModule, '_exec').andReturn(spyProcess);
    });

    it('works', function () {
        nori.scp('test.txt', '10.0.1.20/home/testuser/somedir');
        expect(scpModule._exec).toHaveBeenCalledWith('test.txt 10.0.1.20:/home/testuser/somedir'.split(' '));
    });

    it('requires src', function () {
        var call = function () {
            nori.scp();
        };
        expect(call).toThrow('src is required');
    });

    it('requires src to be a string', function () {
        var call = function () {
            nori.scp({});
        };
        expect(call).toThrow('src must be a string');
    });

    it('requires dest', function () {
        var call = function () {
            nori.scp('test.txt');
        };
        expect(call).toThrow('dest is required');
    });

    it('requires dest to be a string', function () {
        var call = function () {
            nori.scp('test.txt', {});
        };
        expect(call).toThrow('dest must be a string');
    });

    it('uses dest user', function () {
        nori.scp('test.txt', 'testuser@10.0.1.20/home/testuser/somedir');
        expect(scpModule._exec).toHaveBeenCalledWith('test.txt testuser@10.0.1.20:/home/testuser/somedir'.split(' '));
    });

    it('uses dest port', function () {
        nori.scp('test.txt', '10.0.1.20:9022/home/testuser/somedir');
        expect(scpModule._exec).toHaveBeenCalledWith('-P 9022 test.txt 10.0.1.20:/home/testuser/somedir'.split(' '));
    });

    it('returns command', function () {
        var command = nori.scp('test.txt', '10.0.1.20/home/testuser/somedir');
        expect(command).toBeTruthy();
        expect(command._process).toEqual(spyProcess);
    });

    describe('callback', function () {

        var callback;

        beforeEach(function () {
            callback = jasmine.createSpy('callback');
        });

        it('runs when done', function () {
            nori.scp('test.txt', '10.0.1.20/home/testuser/somedir', {}, callback);
            expect(callback).not.toHaveBeenCalled();
            spyProcess.exit();
            expect(callback).toHaveBeenCalled();
        });

        it('includes exit code', function () {
            nori.scp('test.txt', '10.0.1.20/home/testuser/somedir', {}, callback);
            spyProcess.exit(123);
            expect(callback).toHaveBeenCalledWith(123, '');
        });

        it('includes output from stdout and stderr', function () {
            nori.scp('test.txt', '10.0.1.20/home/testuser/somedir', {}, callback);
            spyProcess.sendStdOut('some ');
            spyProcess.sendStdErr('data');
            spyProcess.exit();
            expect(callback).toHaveBeenCalledWith(0, 'some data');
        });
    });
});

describe('_exec', function () {

    var spyProcess = {};

    beforeEach(function () {
        spyOn(childProcess, 'spawn').andReturn(spyProcess);
    });

    it('calls child_process.spawn()', function () {
        scpModule._exec(['test.txt', '10.0.1.20:/home/testuser/somedir']);
        expect(childProcess.spawn).toHaveBeenCalledWith('scp', 'test.txt 10.0.1.20:/home/testuser/somedir'.split(' '));
    });

    it('returns process', function () {
        var process = scpModule._exec(['test.txt', '10.0.1.20:/home/testuser/somedir']);
        expect(process).toEqual(spyProcess);
    });
});
