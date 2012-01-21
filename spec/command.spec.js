var Command = require('../lib/command');
var childProcess = require('child_process');

describe('Command', function () {

    var spyProcess = {
        kill: jasmine.createSpy()
    };
    var command = new Command(spyProcess);

    it('stop() terminates underlying process', function () {
        command.stop();
        expect(spyProcess.kill).toHaveBeenCalled();
    });
});
