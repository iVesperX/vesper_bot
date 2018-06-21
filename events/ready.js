const config = require('../config.json');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true);
const data = db.getData('/');

const maintenance = true;
const precedent = maintenance ? '⛔ ' : '';

const init = require('../util/init.js');

exports.run = (client => {
  console.log('Vesper locked and loaded.');

  if (data.init !== true) init.initialize.all(client);

  let setStatus = setInterval(function () {
    // Game Presence Interval
    let games = [
      { value: `in only ${client.guilds.size} guilds...`, type: 'PLAYING', help: false },
      { value: `with ${client.users.get(config.ownerID).tag}`, type: 'PLAYING', help: true },

      { value: `${client.users.size} users`, type: 'WATCHING', help: true },
      { value: `like a hawk 🦅`, type: 'WATCHING', help: true },

      { value: `${client.users.size} users`, type: 'LISTENING', help: true },
      { value: `YouTube Red`, type: 'LISTENING', help: true },

      // { value: ``, type: '', url: '', help: false }
    ];

    // games.forEach(value => value.url = value.url ? value.url : '');
    
    let i = Math.floor(Math.random() * games.length);

    client.user.setPresence({
      game: { name: `${games[i].value}${games[i].help ? ` | ${config.prefix}help` : ''}`, url: games[i].url, type: games[i].type },
      status: maintenance ? 'dnd' : 'online'
    });
  }, 30000);
  
  client.user.setUsername(precedent + 'Vesper');
});