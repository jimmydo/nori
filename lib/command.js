function Command(process) {
    this._process = process;
}

Command.prototype = {

    stop: function () {
        this._process.kill();
    }
};

module.exports = Command;
