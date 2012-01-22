var childProcess = require('child_process');

var TIMEOUT_MILLISECONDS = 10000;

module.exports = {

    shellEscape: function (value) {
        return "'" + value.replace("'", "'\\''") + "'";
    },

    waitForPort: function (port, callback) {
        if (!callback) {
            throw new Error('callback is required');
        }

        var checkCommand = 'netstat -an | grep ' + port;
        var timeoutId;

        function checkPort() {
            if (!callback) {
                return;
            }

            childProcess.exec(checkCommand, function (error, stdout, stderr) {
                if (!callback) {
                    return;
                }

                if (error) {
                    setTimeout(checkPort, 500);
                    return;
                }

                clearTimeout(timeoutId);
                timeoutId = null;
                callback();
            });
        }

        timeoutId = setTimeout(function () {
            timeoutId = null;
            callback({message: 'timeout'});
            callback = null;
        }, TIMEOUT_MILLISECONDS);
        checkPort();
    }
};
