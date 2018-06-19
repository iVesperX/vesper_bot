const Discord = require('discord.js');
const config = require('../config.json');

const init = require('../util/init.js');

const JsonDB = require('node-json-db');
const db = new JsonDB('data', true, true);

const roles = {
  players: '417462892087214081',
  verified: '421819247988310026',
  spectators: '319613891208282112'
};

exports.run = ((client, message, args) => {
  const reset_flag = '-r';  

  const pl_server = client.guilds.get('310995545588105217');
  const pl_name = pl_server.name;
  const pl_icon = pl_server.iconURL;
  const pl_invite = '';

  db.reload();
  const data = db.getData('/');
  const players = data.players;
  const users = data.users;

  if (players.length <= 1 && users.length <= 1) return message.channel.send('There are currently no participants in PL.');

  if (reset_flag == args[0]) {
    if (!config.accessIDs.includes(message.author.id)) return;
    
    message.channel.send('Are you sure you want to remove all existing players (teams will be removed as well)? Type \`YES\` to confirm or \`NO\` to cancel this query.\n\n*__Note__: This action can not be undone.*').then(() => {
      const filter = (new_message => message.author.id == new_message.author.id);
      const collector = message.channel.createMessageCollector(filter);

      collector.on('collect', m => {
        if (m.content == 'YES') {
          init.initialize.all(client);
          message.channel.send('All players successfully cleared.');          
          collector.stop();
        } else if (m.content == 'NO') {
          message.channel.send('Query closed.');
          collector.stop();
        } else if (m.content.toUpperCase() == 'YES' || m.content.toUpperCase() == 'NO') {
          message.channel.send(`Query replies are case-sensitive. Type \`${m.content.toUpperCase()}\` to perform your action.`);
        } else {
          message.channel.send('Invalid input. Type \`NO\` to cancel the query.');
        }
      });
    });
  } else {
    if (!pl_server) return;
    const players_list = new Discord.RichEmbed();
    
    players_list.setAuthor(pl_name, pl_icon, pl_invite)
         .setColor(role_color)
         .setDescription('List of all players within PL.')
         .setThumbnail(pl_icon)
         .setFooter(client.user.tag, client.user.avatarURL);

    for (let group in data) {
      if (group == 'init' || group == 'teams') continue;

      let role = (group != 'players') ? roles.verified : roles.players;
      let full_list = '';

      for (let i = 1; i < data[group].length; i++) {
        if (i > 1) full_list += ', ';
        full_list += (group != 'players') ? data[group][i] : data[group][i].name;
      }

      players_list.addField(`**<@&${role}>**`, full_list);
    }

    message.channel.send(players_list);
  }
});