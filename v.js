const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true });

const MongoClient = require('mongodb').MongoClient;
const login = process.env.login ? process.env.login : require('./storage/passwords.json').pl_login;
const url = `mongodb://${login}@ds018258.mlab.com:18258/pl_data`;

const fs = require('fs');
const token = process.env.token ? process.env.token : require('./storage/passwords.json').token;

console.log(`url: ${url}`);
console.log(`token: ${token}`);

MongoClient.connect(url, { useNewUrlParser: true }, (err, database) => {
  if (err) return console.log('Error connecting to database.');

  client.database = database.db('pl_data');

  fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
  
    for (let i = 0; i < files.length; i++) {
      let event_file = require(`./events/${files[i]}`),
          event = files[i].split('.')[0];
      client.on(event, (...args) => event_file.run(client, ...args));
    }
  });
  
  client.login(token);
});