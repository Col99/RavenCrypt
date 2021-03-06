// Karma configuration
// Generated on Tue Feb 25 2014 20:24:30 GMT+0100 (W. Europe Standard Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
        {pattern: 'src/common/jquery/jquery.js', served: true, included: true},
        {pattern: 'src/common/socket.io-client/socket.io.js', served: true, included: true},
        {pattern: 'src/common/node-uuid/uuid.js', served: true, included: true},

        {pattern: 'src/crypto/openpgpjs/openpgp.min.js', served: true, included: true},
        {pattern: 'src/crypto/openpgpjs/openpgp.worker.js', served: true, included: false},
        
        {pattern: 'src/crypto/lz-string/lz-string.js', served: true, included: true},
        {pattern: 'src/crypto/RavenCrypt/*.js', served: true, included: true},

        {pattern: 'src/lib/ydn-db/ydn.db-isw-core-crypt-qry-dev.js', served: true, included: true},
        {pattern: 'src/js/ydndb-schema.js', served: true, included: true},
        {pattern: 'tests/ydndb-test-storage.js', served: true,  included: true},

        'tests/*.js'
    ],

    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
