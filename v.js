const Discord = require('discord.js'),
      client = new Discord.Client({ autoReconnect: true });

let storage = { pl_login: '', token: '' };

try {
  storage = require('./storage/passwords.json');
} catch (err) {}

const MongoClient = require('mongodb').MongoClient,
      login = process.env.pl_login ? process.env.pl_login : storage.pl_login,
      url = `mongodb+srv://${login}@pldata.lm95s.mongodb.net/pl_data?retryWrites=true&w=majority`;

const fs = require('fs'),
      token = process.env.token ? process.env.token : storage.token;

MongoClient.connect(url, { useNewUrlParser: true }, (err, database) => {
  if (err) return console.log('Error connecting to database.');
  if (process.env && process.env.token) client.deployed = true;

  client.database = database.db('pl_data');

  fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
  
    for (let i = 0; i < files.length; i++) {
      let event_file = require(`./events/${files[i]}`),
          event = files[i].split('.')[0];
      client.on(event, (...args) => event_file.run(client, ...args));
    }
  });

  client.login(token).then(() => {
    console.log('Successfully authenticated via bot token.')
  });
});
