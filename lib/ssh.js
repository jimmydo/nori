var Command = require('./command');
var _ = require('underscore');
var childProcess = require('child_process');
var url = require('url');

var SSH_NAME = 'ssh';

function buildSshArgs(connectionString, options) {

    if (!connectionString) {
        throw new Error('connection string is required');
    }

    if (!_.isString(connectionString)) {
        throw new Error('connection string must be a string');
    }

    var urlData = url.parse('ssh://' + connectionString);
    var args = [];

    // -i
    if (options.privateKeyFile) {
        args.push('-i', options.privateKeyFile);
    }

    // -L
    var forward = options.localForward;
    if (forward) {
        args.push('-L');
        var forwardParts = [];
        if (forward.bindAddress) {
            forwardParts.push(forward.bindAddress, ':');
        }
        forwardParts.push(forward.port, ':', forward.host, ':', forward.hostPort);
        args.push(forwardParts.join(''));
    }

    // -p
    if (urlData.port) {
        args.push('-p', '' + urlData.port);
    }

    // [usernme@]hostname
    if (urlData.auth) {
        args.push(urlData.auth + '@' + urlData.hostname);
    } else {
        args.push(urlData.hostname);
    }

    // -N
    if (forward) {
        args.push('-N');
    }

    // command
    if (options.command) {
        // `childProcess.spawn()` will ensure that the command is escaped to be
        // exactly one parameter when passed to the `ssh` command.

        // NOTE: It's also okay to pass a single command with arguments as
        // multiple arguments at the end of the `ssh` command. You just have
        // to make sure each argument is individually escaped.
        // In other words, giving `ssh`:
        //     escaped('command -a arg1 arg2')
        // is equivalent to giving each individually-escaped part, separated by
        // spaces:
        //     escaped('command') escaped('-a') escaped('arg1') escaped('arg2')
        args.push(options.command);
    }

    return args;
}

var ssh = module.exports = {

    run: function (connectionString, options, callback) {
        options = options || {};
        callback = callback || function () {};

        var args = buildSshArgs(connectionString, options);
        var sshProcess = ssh._exec(args);
        var output = '';
        sshProcess.stdout.on('data', function (chunk) {
            output += chunk;
        });
        sshProcess.stderr.on('data', function (chunk) {
            output += chunk;
        });
        sshProcess.on('exit', function (code) {
            if (code) {
                callback({code: code}, output);
                return;
            }

            callback(null, output);
        });

        return new Command(sshProcess);
    },

    _exec: function (args) {
        return childProcess.spawn(SSH_NAME, args);
    }
};
