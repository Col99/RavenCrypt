module( "tests" );

test( "hello test", function() {
    ok( 1 == "1", "Passed!" );
});

test( "openpgp initialized", function() {
    ok( openpgp != null, "Passed!" );
});

test( "console test", function() {
    console.log("ConsoleTest", "Hello World!");
    ok( true == true, "Log works!" );
});
