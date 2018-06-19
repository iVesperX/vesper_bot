const fs = require('fs');
const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const CODE = '```';

exports.run = ((client, message, args) => {
  fs.readFile('data.json', (err, data) => {
    client.fetchUser(config.ownerID).then(user => {
      user.send(`${CODE}json\n${data + CODE}`);
    })
  });
});