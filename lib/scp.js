var Command = require('./command');
var _ = require('underscore');
var childProcess = require('child_process');
var url = require('url');

var SCP_NAME = 'scp';

function buildScpArgs(src, dest, options) {
    var destData = url.parse('ssh://' + dest);
    var args = [];

    // -i
    if (options.privateKeyFile) {
        args.push('-i', options.privateKeyFile);
    }

    if (destData.port) {
        args.push('-P', destData.port);
    }

    args.push(src);

    var optionalUser;
    if (destData.auth) {
        optionalUser = destData.auth + '@';
    } else {
        optionalUser = '';
    }

    args.push(optionalUser + destData.hostname + ':' + destData.pathname);

    return args;
}

var scp = module.exports = {

    run: function (src, dest, options, callback) {
        options = options || {};

        if (!src) {
            throw new Error('src is required');
        }

        if (!_.isString(src)) {
            throw new Error('src must be a string');
        }

        if (!dest) {
            throw new Error('dest is required');
        }

        if (!_.isString(dest)) {
            throw new Error('dest must be a string');
        }

        callback = callback || function () {};
        var args = buildScpArgs(src, dest, options);
        var scpProcess = scp._exec(args);
        var output = '';
        scpProcess.stdout.on('data', function (chunk) {
            output += chunk;
        });
        scpProcess.stderr.on('data', function (chunk) {
            output += chunk;
        });
        scpProcess.on('exit', function (code) {
            if (code) {
                callback({code: code}, output);
                return;
            }

            callback(null, output);
        });
        return new Command(scpProcess);
    },

    _exec: function (args) {
        return childProcess.spawn(SCP_NAME, args);
    }
};
