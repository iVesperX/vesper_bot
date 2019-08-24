const config = require('../storage/config.json');

const maintenance = false;
const precedent = maintenance ? '⛔ ' : '';

const init = require('../util/init.js');

exports.run = (async (client) => {
  console.log('Vesper locked and loaded.');

  if (client.deployed) {
    client.fetchUser(config.ownerID).then(owner => {
      const today = new Date(),
            formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString()
            account = process.env.account ? ` by \`${process.env.account}@outlook.com\`` : '';
      
      owner.send(`Successfully deployed${account} on ${formatted_date} (UTC)`);
    });
  }

  let initialized = await client.database.collection('init').findOne({});
  (!initialized || !initialized.data || initialized.data !== true) ? init.initialize.all(client) : console.log('Data has already been initialized.');
  
  init.initialize.invite(client);

  setInterval(function () {
    // Game Presence Interval
    let games = [
      { value: `in only ${client.guilds.size} guilds...`, type: 'PLAYING', help: false },
      { value: `with ${client.users.get(config.ownerID).tag}`, type: 'PLAYING', help: true },
      { value: `24/7 ❤`, type: 'PLAYING', help: true },

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
  
  client.user.setUsername(precedent + config.name);
});