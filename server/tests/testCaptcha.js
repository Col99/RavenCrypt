var captchapng = require('captchapng');

exports.testGenerate = function(test){

    var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    var img = p.getBase64();
    test.equals(typeof img, "string", "should be base64 string");

    var imgbase64 = new Buffer(img,'base64');
    test.ok(imgbase64!=null);

    test.done();
}