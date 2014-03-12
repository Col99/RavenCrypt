//https://github.com/yathit/ydn-db

var schema = {
    stores: [
        {
            name: 'account',
            keyPath: ['user', 'server'],
            indexes: [{
                keyPath: ['user', 'server'],
                name: 'pk_index',
                unique: true
            }]
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server', 'id'],
            indexes: [{
                keyPath: ['user', 'server', 'id'],
                name: 'pk_index',
                unique: true
            }]
        }, {
            name: 'files',
            keyPath: ['name', 'server', 'hash'],
            indexes: [{
                keyPath: ['name', 'server', 'hash'],
                name: 'pk_index',
                unique: true
            }]
        }, {
            name: 'conversationAttendee',
            keyPath: ['user', 'server', 'conversationID'],
            indexes: [{
                keyPath: ['user', 'server', 'conversationID'],
                name: 'pk_index',
                unique: true
            }]
        }, {
            name: 'contact',
            keyPath: ['user', 'server', 'contactName', 'contactServer'],
            indexes: [{
                keyPath: ['user', 'server', 'contactName', 'contactServer'],
                name: 'pk_index',
                unique: true
            }]
        }, {
            name: 'contactPubKey',
            keyPath: ['user', 'server', 'contactName', 'contactServer', 'id'],
            indexes: [{
                keyPath: ['user', 'server', 'contactName', 'contactServer', 'id'],
                name: 'pk_index',
                unique: true
            }]
        }]
};
