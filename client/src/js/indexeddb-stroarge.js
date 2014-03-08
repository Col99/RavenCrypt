var indexedDB = window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;
var IDBKeyRange=window.IDBKeyRange||window.mozIDBKeyRange||window.webkitIDBKeyRange||window.msIDBKeyRange;

//welcome to my horrible 9pm-3am hack of indexedb + amberjs.. while understanding little of js
//the goal of this module has been reached (returning one correct instance of an indexeddb) ..though i think through horrible methods
//however i guess it doesn't really matter this should work =)

angular.module('indexedDB', []).provider('$indexedDB', function() {

    //https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB

    var module = this;

    module.indexedDB = indexedDB;
    module.IDBKeyRange = IDBKeyRange;

    module.db = null;
    module.name = "RavenCrypt";
    module.version = 3;

    module.open =function(name, version){
        module.name = name;
        module.version = version;
    }

    function needsUpgrade(oldVersion, expectedVersion) {
        //don't run all migrations if they are not necessary.. this makes development easier ;)
        return oldVersion < expectedVersion && expectedVersion <= appVersion
    }

    function getDB(callback){

        if(module.db) {
            callback(module.db);
        }

        var request = indexedDB.open(module.name, appVersion);

        request.onsuccess = function(event) {
            var db = event.target.result;
            useDatabase(db);
        };

        request.onerror = function(event) {
            // Do something with request.errorCode!
            alert('db error!')
        };

        request.onupgradeneeded = function(event) {
            //http://www.w3.org/TR/IndexedDB/
            //https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB
            var db = event.target.result;

            // Version 1 is the first version of the database.
            if (needsUpgrade(event.oldVersion, 1)) {
                db.createObjectStore("accounts", {keyPath: "name"});
            }
            if (needsUpgrade(event.oldVersion, 2)) {
                db.createObjectStore("asyncKeys", {keyPath: ["accountName","keyID"]});
            }
            if (needsUpgrade(event.oldVersion, 3)) {
                if (db.objectStoreNames.contains("asyncKeys")) {
                    var store = event.target.transaction.objectStore("asyncKeys");
                    store.createIndex("name", "accountName");
                } else {
                    throw "err";
                }
            }
        };

        //  request.onblocked = function(event) {
        //        // If some other tab is loaded with the database, then it needs to be closed
        //        // before we can proceed.
        //        alert("Please close all other tabs with this site open!");
        //    };

        function useDatabase(db) {
            module.db = db;

            db.onversionchange = function() {
                db.close();
                //im hoping the tabs that requested the update has done so while this tab is reloading
                window.location.reload();
            };

            callback(db);
        }
    }

    this.$get = function($q, $timeout) {
        return {
            getDB: getDB
        }
    };

});