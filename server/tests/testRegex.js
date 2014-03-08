var configJs = require("../config/config.js");
global.config = new configJs.config('test');

exports.testServerRegex = function(test){
    var rx = new RegExp(global.config.validations.server.regExpText);

    test.equal(rx.test('lasdfsasdol.de'),true);

    //port
    test.equal(rx.test('lol.de'),true);
    //connecting to port 0 is evil!
    test.equal(rx.test('lol.de:0'),false);
    test.equal(rx.test('lol.de:1'),true);
    test.equal(rx.test('lol.de:1000'),true);
    test.equal(rx.test('lol.de:59999'),true);
    test.equal(rx.test('lol.de:65535'),true);
    test.equal(rx.test('lol.de:65536'),false);
    test.equal(rx.test('lol.de:70000'),false);


    //one letter
    test.equal(rx.test('l.de'),true);


    //rules for the postion of the minus, can't have minus in first 3 places or at the end
    test.equal(rx.test('-.de'),false);
    test.equal(rx.test('a-.de'),false);
    test.equal(rx.test('a-a.de'),false);
    test.equal(rx.test('aa-a.de'),false);
    test.equal(rx.test('aaa-a.de'),true);
    test.equal(rx.test('aaa--a.de'),true);
    test.equal(rx.test('aaa--.de'),false);
    test.equal(rx.test('aaa--.de'),false);

    //max 63 chars for individual domain part between dots, except top level
    test.equal(rx.test('012345678901234567890123456789012345678901234567890123456789aaa.de'),true);
    test.equal(rx.test('012345678901234567890123456789012345678901234567890123456789aaaa.de'),false);

    //sub-domains
    test.equal(rx.test('l.l.lol.de'),true);
    test.equal(rx.test('l..lol.de'),false);
    test.equal(rx.test('..l.de'),false);

    //top level domains
    test.equal(rx.test('l.a'),false);
    test.equal(rx.test('l.aa'),true);
    test.equal(rx.test('l.aaaaaa'),true);
    test.equal(rx.test('l.aaaaaaa'),false);

    //max domain part len with dots = 253 .. (the domain may get longer if there is no port, bug in current max length check)
    test.equal(rx.test(
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        'aaaaa',
        ':12345'),true);
    test.equal(rx.test(
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        '012345678901234567890123456789012345678901234567890123456789a.' +
        'aaaaaa',
        ':12345'),false);

    test.done();

};