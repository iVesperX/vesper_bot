import { Client, Constants, Intents } from 'discord.js';
import MongoClient from 'mongodb';
// import { pl_login, token } from './storage/passwords.json';
import * as fs from 'fs';
import { createRequire } from 'module';

let storage = {};

try {
  const pseudoRequire = createRequire(import.meta.url);
  storage = pseudoRequire('./storage/passwords.json');

} catch (err) {
  console
  console.error('Please define a ./storage/passwords.json file to run this application.');
}


if (storage) {
  const client = new Client({ intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS
  ] });
  console.log(`Discord Version: ${Constants.Package.version}`);

  const mongo_login = storage.pl_login;
  const url = `mongodb+srv://${mongo_login}@pldata.lm95s.mongodb.net/pl_data?retryWrites=true&w=majority`;

  const bot_token = storage.token;

  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, database) => {
    if (err) return console.error(`Error connecting to database. ${err}`);
    if (storage.token) client.deployed = true;

    client.database = database.db('pl_data');

    fs.readdir("./events/", null, async (err, files) => {
      if (err) return console.error(err);

      for (let i = 0; i < files.length; i++) {
        let event_module = await import(`./events/${files[i]}`),
          event = files[i].split('.')[0];
        client.on(event, (...args) => event_module.run(client, ...args));
      }
    });

    client.login(bot_token).then(() => console.log('Successfully authenticated via bot token.'));
  });
}