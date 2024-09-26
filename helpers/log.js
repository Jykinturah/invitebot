'use strict';

const config = require('../config.json');

module.exports = {
    inviteLog: async(client, message) => {
        if (config.logID) return client.channels.cache.get(config.logID).send(message);
    }
};