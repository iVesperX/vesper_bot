const fs = require('fs');
const config = require('../config.json');

const reactor = require('../util/reactor.js');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true);

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

  const callback = () => {
    reactor.success(message, 'Succesfully returned database information');
  };

  fs.readFile('data.json', (err, data) => {
    client.fetchUser(config.ownerID).then(user => {
      let parsed_data = JSON.parse(data),
          response = '';
      if (!args.length) {
        response = `${CODE}json\n${data + CODE}`;
        return parse_and_send(user, response);
        // return user.send(response).then(callback);
      }

      switch (args[0]) {
        case '-teams':
          response = `${CODE}json\n${JSON.stringify(parsed_data.teams) + CODE}`;
          return user.send(response).then(callback);
          break;
        case '-players':
          response = `${CODE}json\n${JSON.stringify(parsed_data.players) + CODE}`;
          return user.send(response).then(callback);
          break;
        case '-verified':
          response = `${CODE}json\n${JSON.stringify(parsed_data.verified) + CODE}`;
          return  user.send(response).then(callback);
          break;
        default:
          return user.send(`${CODE}json\n${data + CODE}`).then(callback);
          break;
      }
    });
  });
});