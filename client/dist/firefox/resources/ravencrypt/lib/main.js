// This is an active module of the 887 Add-on
// import the modules we need
var data = require('self').data;
var tabs = require('tabs');
var toolbarbutton = require("toolbarbutton");
var {Cc, Ci, Cu} = require('chrome');

var tbb = toolbarbutton.ToolbarButton({
    id: "RavenCryptButton",
    label: "RavenCrypt",
    image: data.url('img/icon16.png'),
    onClick:  function(evt) {
        tabs.open(data.url("files/index.html"));
        return true;
    }
});


// exports.main is called when extension is installed or re-enabled
exports.main = function(options, callbacks) {
    if (options.loadReason == "install") {
        tbb.moveTo({
            toolbarID: "nav-bar",
            forceMove: true
        });
    } else if (options.loadReason == "enable") {
        tbb.moveTo({
            toolbarID: "nav-bar",
            forceMove: false
        });
    }
};

exports.onUnload = function(reason) {
    if (reason == "uninstall" || reason == "disable")
        tbb.destroy();
}


