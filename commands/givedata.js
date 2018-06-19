const fs = require('fs');
const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const CODE = '```';
const max_text_length = 2000;

exports.run = ((client, message, args) => {
  if (message.author.id != config.ownerID) return;

  const parse_and_send = (async (user, text) => {
    for (let i = 0; i < text.length; i += max_text_length) {
      let new_text = text.slice(i, i + max_text_length);

      await user.send(`${CODE}json\n${new_text + CODE}`);
    }
  });

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