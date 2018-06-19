const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const token = require('./token.json');

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);

  for (let i = 0; i < files.length; i++) {
    let event_file = require(`./events/${files[i]}`),
        event = files[i].split('.')[0];
    client.on(event, (...args) => event_file.run(client, ...args));
  }
});

client.login(token ? token.value : process.env.token);