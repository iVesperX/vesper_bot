const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);
const data = db.getData('/');

const init = require('../util/init.js');

exports.run = (client => {
  console.log('Vesper locked and loaded.');

  if (data.init !== true) init.initialize.all(client);

  client.user.setPresence({
    game: { name: `${client.users.size} users | ${config.prefix}help`, type: 'LISTENING' },
    status: 'online'
  });
});