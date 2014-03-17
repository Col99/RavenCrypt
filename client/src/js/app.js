const appVersion = 3;

var app = angular
    .module('RavenCrypt', ['ui.router', 'ydnDB', 'pascalprecht.translate'])
    .config(function($stateProvider, $urlRouterProvider, $translateProvider) {
        // For any unmatched url, send to /route1
        $urlRouterProvider.otherwise("/login");


        var templateLoc = window.location.pathname;

        var pathArray = templateLoc.split( '/' );
        var targetLoc = "";

        for (var i = 1; i < pathArray.length - 1; i++ ) {
            targetLoc += "/";
            targetLoc += pathArray[i];
        }

        targetLoc = targetLoc + "/crypto/openpgpjs/openpgp.worker.js";

        openpgp.initWorker(targetLoc);

        //we can set our controllers here, but we can also set them inside the div... i don't know whats better (yet)
        //controller: "LoginCtrl"

        //more info for the multi lang module:
        //http://pascalprecht.github.io/angular-translate/docs/en/#/guide/07_multi-language
        //a german article from the author on how to use it
        //http://angularjs.de/artikel/angularjs-i18n-ng-translate


        //SOME EXPLANATION ABOUT STATES ON GITHUB: https://github.com/angular-ui/ui-router/issues/175

        $translateProvider.useStaticFilesLoader({
            prefix: 'lang-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en_US');

        //http://www.ng-newsletter.com/posts/angular-ui-router.htmlS
        $stateProvider
            .state('main', {
                url: "/main/:userID",
                templateUrl: "partials/main/main.html",
                controller: "MainCtrl"
            })
            .state('login', {
                url: "/login",
                templateUrl: "partials/login/login.html",
                controller: "LoginCtrl"
            })
            .state('register', {
                abstract: true,
                templateUrl: "partials/register/register.html"
            })
                .state('register.server', {
                    url: "/register",
                    templateUrl: "partials/register/server.html",
                    controller: "RegisterServerCtrl"
                })
                .state('register.name', {
                    templateUrl: "partials/register/name.html",
                    params: ['server'],
                    controller: "RegisterNameCtrl"
                })
                .state('register.importKey', {
                    templateUrl: "partials/register/importKey.html",
                    params: ['userName', 'server'],
                    controller: "RegisterImportKeyCtrl"
                })
                .state('register.createKey', {
                    templateUrl: "partials/register/createKey.html",
                    params: ['userName', 'server'],
                    controller: "RegisterCreateKeyCtrl"
                })
                .state('register.signUp', {
                    templateUrl: "partials/register/signUp.html",
                    params: ['userName', 'server', 'privateKeyArmored', 'publicKeyArmored', 'keyPassword'],
                    controller: "RegisterSignUpCtrl"
                })
                .state('register.confirm', {
                    templateUrl: "partials/register/confirm.html",
                    params: ['userName', 'server', 'privateKeyArmored', 'publicKeyArmored', 'keyPassword', 'confirmCodeImage'],
                    controller: "ConfirmCtrl"
                })
    });

//TODO maybe, move this in an external config file
app.constant("$rcConstants", {
    "ACCOUNT_STORE": "accounts",
    "USER_NAME_MIN_LENGTH": 3,
    "USER_NAME_MAX_LENGTH": 40,
    "USER_NAME_PATTERN": "^[a-zA-Z0-9_]{3,40}$",
    "SERVER_PATTERN": "(?=[\\da-z-\\.]{3,253}(\\:.{1,5})?$)^\\+?([\\da-z]{1}([\\da-z]{1}([\\da-z]{1}([\\da-z-]{1,59}([\\da-z]{1}))?)?)?\\.)+([a-z]{2,6})(\\:(6553[0-5]|655[0-2]\\d|65[0-4]\\d\\d|6[0-4]\\d{3}|[1-5]\\d{4}|[1-9]\\d{0,3}))?$"
});

app.controller('LangCtrl', ['$scope', '$translate', function ($scope, $translate) {

    $scope.changeLang = function (key) {
        $translate.uses(key).then(function (key) {
            //console.log("Switched language to " + key + " .");
        }, function (key) {
            console.log("Could not switch language!");
        });
    };
}]);

//add fastclick, so our app buttons do not lag in mobile.
$(function() {
    $("html").removeClass("no-js").addClass("js");
    var $window = $(window);
    new FastClick(document.body);
    $(document).ready(function($) {
        // Disable certain links in docs
        $('section [href^=#]').click(function (e) {
            e.preventDefault();
        });
        // Make code pretty
        window.prettyPrint && window.prettyPrint();
    });
});

