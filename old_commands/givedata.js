import * as fs from 'fs';
import { success } from '../util/reactor.js';
// import { ownerID } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const CODE = '```';
const max_text_length = 2000;

export const run = (async (client, message, args) => {
  if (message.author.id != config.ownerID) return;

  const parse_and_send = (async (user, text) => {
    for (let i = 0; i < text.length; i += max_text_length) {
      let new_text = text.slice(i, i + max_text_length);
      await user.send(`${CODE}json\n${new_text + CODE}`);
    }
  });

  const callback = () => success(message, 'Succesfully returned database information');

  client.fetchUser(config.ownerID).then(user => {
    let data = "{}";
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
      case '-players':
        response = `${CODE}json\n${JSON.stringify(parsed_data.players) + CODE}`;
        return user.send(response).then(callback);
      case '-verified':
        response = `${CODE}json\n${JSON.stringify(parsed_data.verified) + CODE}`;
        return  user.send(response).then(callback);
      default:
        return user.send(`${CODE}json\n${data + CODE}`).then(callback);
    }
  });
});