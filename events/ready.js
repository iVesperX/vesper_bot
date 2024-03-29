import { initialize } from '../util/init.js';
// import { ownerID, date_options, prefix, name as _name } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const maintenance = false;
const precedent = maintenance ? '⛔ ' : '';

export const run = (async (client) => {
  console.log('Vesper locked and loaded.');

  if (client.deployed) {
    const today = new Date();
    const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
    // const account = process.env.account ? ` by \`${process.env.account}@outlook.com\`` : '';

    if (config.bot_server) {
      client.channels.fetch(config.bot_server.mod.login).then(channel => {
        channel.send(`Successfully deployed${''} on ${formatted_date} (UTC)`);
      });
    }
  }

  let initialized = await client.database.collection('init').findOne({});
  (!initialized || !initialized.data || initialized.data !== true) ? initialize.all(client) : console.log('Data has already been initialized.');
  
  initialize.invite(client);

  // Game Presence Interval
  const total_users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
  const owner = await client.users.fetch(config.ownerID);

  let games = [
    { value: `in only ${client.guilds.cache.size} guilds...`, type: 'PLAYING', help: false },
    { value: `with ${owner.username}`, type: 'PLAYING', help: true },
    { value: `24/7 ❤`, type: 'PLAYING', help: true },

    { value: `${total_users} users`, type: 'WATCHING', help: true },
    { value: `like a hawk 🦅`, type: 'WATCHING', help: true },

    { value: `${total_users} users`, type: 'LISTENING', help: true },
    { value: `YouTube Red`, type: 'LISTENING', help: true },

    { value: `self-reflection`, type: 'COMPETING', help: false }

    // { value: ``, type: '', url: '', help: false }
  ];

  setInterval(function () {
    let i = Math.floor(Math.random() * games.length);

    client.user.setPresence({
      activities: [{ name: `${games[i].value}${games[i].help ? ` | ${config.prefix}help` : ''}`, url: games[i].url, type: games[i].type }],
      status: maintenance ? 'dnd' : 'online'
    });
  }, 30000);
  
  client.user.setUsername(precedent + config.name);
});