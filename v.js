const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true });
const MongoClient = require('mongodb').MongoClient;

const fs = require('fs');
const passwords = './storage/passwords.json';

const login = !fs.existsSync(passwords) ? process.env.token : require(passwords).pl_login;
const token = !fs.existsSync(passwords) ? process.env.token : require(passwords).token;
const url = `mongodb://${login}@ds018258.mlab.com:18258/pl_data`;

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