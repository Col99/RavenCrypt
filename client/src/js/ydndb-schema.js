//https://github.com/yathit/ydn-db

var schema = {
    stores: [
        {
            name: 'account',
            keyPath: ['user', 'server'],
            indexes: [{
                name: 'user'
            }, {
                name: 'server'
            }]
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server']
        }, {
            name: 'userKeyPair',
            keyPath: ['user', 'server', 'id']
        }, {
            name: 'files',
            keyPath: ['name', 'server', 'hash']
        }, {
            name: 'conversationAttendee',
            keyPath: ['user', 'server', 'conversationID']
        }, {
            name: 'contact',
            keyPath: ['user', 'server', 'contactName', 'contactServer']
        }, {
            name: 'contactPubKey',
            keyPath: ['user', 'server', 'contactName', 'contactServer', 'id']
        }]
};
