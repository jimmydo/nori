var nori = require('..');

describe('shellEscape', function () {

    it('handles single quote', function () {
        var escaped = nori.shellEscape('nori\'s');
        expect(escaped).toEqual("'nori'\\''s'");
    });
});
