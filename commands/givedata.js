const fs = require('fs');
const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const CODE = '```';

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  fs.readFile('data.json', (err, data) => {
    client.fetchUser(config.ownerID).then(user => {
      let parsed_data = JSON.parse(data);
      if (!args.length) {
        return user.send(`${CODE}json\n${data + CODE}`);
      }

      switch (args[0]) {
        case '-teams':
          return user.send(`${CODE}json\n${JSON.stringify(parsed_data.teams) + CODE}`);
          break;
        case '-players':
          return user.send(`${CODE}json\n${JSON.stringify(parsed_data.players) + CODE}`);
          break;
        case '-verified':
          return  user.send(`${CODE}json\n${JSON.stringify(parsed_data.verified) + CODE}`);
          break;
        default:
          return user.send(`${CODE}json\n${data + CODE}`);
          break;
      }
    });
  });
});