const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true })

const fs = require('fs');
const token = process.env.token ? process.env.token : require('./passwords.json').token;

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);

  for (let i = 0; i < files.length; i++) {
    let event_file = require(`./events/${files[i]}`),
        event = files[i].split('.')[0];
    client.on(event, (...args) => event_file.run(client, ...args));
  }
});

client.login(token);