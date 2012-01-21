var childProcess = require('child_process');

module.exports = {

    shellEscape: function (value) {
        return "'" + value.replace("'", "'\\''") + "'";
    },

    waitForPort: function (port, callback) {
        var checkCommand = 'netstat -an | grep ' + port;

        function checkPort() {
            childProcess.exec(checkCommand, function (error, stdout, stderr) {
                if (error) {
                    setTimeout(checkPort, 500);
                    return;
                }

                callback();
            });
        }

        checkPort();
    }
};
