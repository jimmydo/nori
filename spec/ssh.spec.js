var events = require('events');
var nori = require('..');
var sshModule = require('../lib/ssh');

describe('ssh', function () {
    var spyProcess = new events.EventEmitter();
    spyProcess.stdout = jasmine.createSpyObj('stdout spy', ['on']);
    spyProcess.stderr = jasmine.createSpyObj('stderr spy', ['on']);
    spyProcess.exit = function () {
        this.emit('exit');
    };

    beforeEach(function () {
        spyOn(sshModule, '_exec').andReturn(spyProcess);
    });

    it('basic usage', function () {
        nori.ssh('10.0.1.20');
        expect(sshModule._exec).toHaveBeenCalledWith('10.0.1.20'.split(' '));
    });

    it('requires connection string', function () {
        var call = function () {
            nori.ssh();
        };
        expect(call).toThrow('connection string is required');
    });

    it('uses username', function () {
        nori.ssh('testuser@10.0.1.20');
        expect(sshModule._exec).toHaveBeenCalledWith('testuser@10.0.1.20'.split(' '));
    });

    it('uses command', function () {
        nori.ssh('10.0.1.20', {
            command: 'pwd'
        });
        expect(sshModule._exec).toHaveBeenCalledWith('10.0.1.20 pwd'.split(' '));
    });

    it('uses port', function () {
        nori.ssh('10.0.1.20:8005');
        expect(sshModule._exec).toHaveBeenCalledWith('-p 8005 10.0.1.20'.split(' '));
    });

    it('uses localForward', function () {
        nori.ssh('10.0.1.20', {
            localForward: {
                port: 7001,
                host: '10.0.1.40',
                hostPort: 22
            }
        });
        expect(sshModule._exec).toHaveBeenCalledWith('-L 7001:10.0.1.40:22 10.0.1.20 -N'.split(' '));
    });

    it('allows localForward with bindAddress', function () {
        nori.ssh('10.0.1.20', {
            localForward: {
                bindAddress: '127.0.0.1',
                port: 7001,
                host: '10.0.1.40',
                hostPort: 22
            }
        });
        expect(sshModule._exec).toHaveBeenCalledWith('-L 127.0.0.1:7001:10.0.1.40:22 10.0.1.20 -N'.split(' '));
    });

    it('returns command', function () {
        var command = nori.ssh('10.0.1.20');
        expect(command).toBeTruthy();
    });

    it('runs callback when done', function () {
        var callback = jasmine.createSpy('callback');
        nori.ssh('10.0.1.20', {}, callback);
        expect(callback).not.toHaveBeenCalled();
        spyProcess.exit();
        expect(callback).toHaveBeenCalled();
    });
});
