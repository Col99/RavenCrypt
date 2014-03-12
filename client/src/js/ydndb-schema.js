//https://github.com/yathit/ydn-db

var schema = {
    stores: [
        {
            name: 'account',
            keyPath: ['user', 'server'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }]
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server', 'id'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }, {
                name: 'id',
                unique: true
            }]
        }, {
            name: 'files',
            keyPath: ['name', 'server', 'hash'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }, {
                name: 'hash',
                unique: true
            }]
        }, {
            name: 'conversationAttendee',
            keyPath: ['user', 'server', 'conversationID'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }, {
                name: 'conversationID',
                unique: true
            }]
        }, {
            name: 'contact',
            keyPath: ['user', 'server', 'contactName', 'contactServer'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }, {
                name: 'contactName',
                unique: true
            }, {
                name: 'contactServer',
                unique: true
            }]
        }, {
            name: 'contactPubKey',
            keyPath: ['user', 'server', 'contactName', 'contactServer', 'id'],
            indexes: [{
                name: 'user',
                unique: true
            }, {
                name: 'server',
                unique: true
            }, {
                name: 'contactName',
                unique: true
            }, {
                name: 'contactServer',
                unique: true
            }, {
                name: 'id',
                unique: true
            }]
        }]
};
