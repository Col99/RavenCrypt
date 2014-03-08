require("../lib/crypto.js");
require("../lib/helper.js");

exports.testHasOwnProperties = function(test){
    var obj = {name: "", cheese:""}

    //test exact
    var res = global.helper.hasOwnProperties(obj, "cheese","name");
    test.equal(true, res);

    //test less
    var res = global.helper.hasOwnProperties(obj, "cheese");
    test.equal(true, res);

    //test different
    var res = global.helper.hasOwnProperties(obj, "cake");
    test.equal(false, res);

    //test exact and different
    var res = global.helper.hasOwnProperties(obj, "cheese","name", "cake");
    test.equal(false, res);

    test.done();
};

exports.testHasExactProperties = function(test){
    var obj = {name: "", cheese:""}

    //test exact
    try {
        var res = global.helper.hasExactProperties(obj, "cheese","name");
    } catch(err) {
        test.ok(false);
    }

    //test less
    try {
        var res = global.helper.hasExactProperties(obj, "cheese");
    } catch(err) {
        test.ok(true);
    }

    //test different
    try {
        var res = global.helper.hasExactProperties(obj, "cake");
    } catch(err) {
        test.ok(true);
    }

    //test exact and different
    try {
        var res = global.helper.hasExactProperties(obj, "cheese","name", "cake");
    } catch(err) {
        test.ok(true);
    }

    test.done();
};