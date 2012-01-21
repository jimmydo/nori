var utils = require('./utils');

var nori = module.exports = {

    scp: require('./scp').run,

    shellEscape: utils.shellEscape,

    ssh: require('./ssh').run,

    waitForPort: utils.waitForPort
};
