const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const fs = require('fs');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);
const data = db.getData('/');

const init = require('./util/init.js');
const t = process.env.token;

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);

  for (let i = 0; i < files.length; i++) {
    let event_file = require(`./events/${files[i]}`),
        event = files[i].split('.')[0];
    client.on(event, (...args) => event_file.run(client, ...args));
  }
});


if (data.init !== true) init.initialize.all();

client.login(t).then(() => {
  if (data.init !== true) init.initialize.all(client);
});