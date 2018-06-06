const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('./config.json');
const fs = require('fs');
const sqlite = require('sqlite');

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);

  for (let i = 0; i < files.length; i++) {
    let event_file = require(`./events/${files[i]}`),
        event = files[i].split('.')[0];
    client.on(event, (...args) => event_file.run(client, ...args));
  }
});

sqlite.open(config.db).then(() => {
  sqlite.run('CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY NOT NULL, team_name TEXT DEFAULT \'\', manager TEXT DEFAULT \'\', manager_id TEXT, players TEXT DEFAULT NULL)').catch(err => {
    return console.log(err);
  });
  
  sqlite.run('CREATE TABLE IF NOT EXISTS players (id INTEGER PRIMARY KEY NOT NULL, name TEXT DEFAULT \'\', team TEXT DEFAULT \'-\', discord_id TEXT, waived_from TEXT DEFAULT \'-\')').catch(err => {
    return console.log(err);
  });

  // Logs in after initial database connection
  client.login(process.env.token);
}).catch(err => {
  console.log(err);
});