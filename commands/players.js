import { EmbedBuilder } from 'discord.js';
import { initialize } from '../util/init.js';
// import { accessIDs } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

const roles = {
  players: '417462892087214081',
  verified: '421819247988310026',
  spectators: '319613891208282112'
};

export const run = (async (client, message, args) => {
  const reset_flag = '-r';  

  const pl_server = client.guilds.fetch('310995545588105217');
  const pl_name = pl_server.name;
  const pl_icon = pl_server.iconURL;

  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;

  // where the magic happens
  const inv = (await client.database.collection('pl_invite').findOne({})).data;
  const players = (await client.database.collection('players').findOne({})).data;
  const users = (await client.database.collection('verified').findOne({})).data;

  if (players.length <= 1 && users.length <= 1) return message.channel.send('There are currently no participants in PL.');

  if (reset_flag == args[0]) {
    if (!config.accessIDs.includes(message.author.id)) return;
    
    message.channel.send('Are you sure you want to remove all existing players (teams will be removed as well)? Type \`YES\` to confirm or \`NO\` to cancel this query.\n\n*__Note__: This action can not be undone.*').then(() => {
      const filter = (new_message => message.author.id == new_message.author.id);
      const collector = message.channel.createMessageCollector(filter);

      collector.on('collect', m => {
        if (m.content == 'YES') {
          initialize.all(client);
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
    const collections = [players, users];
    const players_list = new EmbedBuilder()
        .setAuthor(pl_name, pl_icon, inv)
        .setColor(role_color)
        .setDescription('List of all players within PL.')
        .setThumbnail(pl_icon)
        .setFooter(client.user.username, client.user.avatarURL);

    for (let c = 0; c < collections.length; c++) {
      // 0 : players
      // 1 : users

      let role = (c == 1) ? roles.verified : roles.players;
      let role_name = (c == 1) ? 'Account Verified' : 'Registered Players'
      let role_mention = message.guild.id == '310995545588105217' ? `<@&${role}>` : role_name;
      let full_list = '';

      if (c == 0) {
        for (let i = 1; i < collections[c].length; i++) {
          if (i > 1) full_list += ', ';
          full_list +=collections[c][i].name;
        }
      } else if (c == 1) {
        for (let i in collections[c]) {
          if (i == 0) continue;
          if (full_list.length) full_list += ', ';
          full_list += collections[c][i][0];
        }
      }

      full_list = full_list.length ? full_list : 'N/A';
      players_list.addField(`**${role_mention}**`, full_list);
    }

    message.channel.send({ embeds: [players_list] });
  }
});