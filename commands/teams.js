import { RichEmbed } from 'discord.js';
import { initialize } from '../util/init.js';
// import { accessIDs } from '../storage/config.json';
import { createRequire } from 'module';

const pseudoRequire = createRequire(import.meta.url);
const config = pseudoRequire('../storage/config.json');

export const run = (async (client, message, args) => {
  const reset_flag = '-r';

  const pl_server = client.guilds.fetch('310995545588105217');
  const pl_name = pl_server.name;
  const pl_icon = pl_server.iconURL;

  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;
  
  // where the magic happens
  const inv = (await client.database.collection('pl_invite').findOne({})).data;
  const teams = (await client.database.collection('teams').findOne({})).data;
  const players = (await client.database.collection('players').findOne({})).data;

  if (teams.length <= 1) return message.channel.send('There are currently no teams.');
  
  if (reset_flag == args[0]) {
    if (!config.accessIDs.includes(message.author.id)) return;

    message.channel.send('Are you sure you want to remove all teams? Type \`YES\` to confirm or \`NO\` to cancel this query.\n\n*__Note__: This action can not be undone.*').then(() => {
      const filter = (new_message => message.author.id == new_message.author.id);
      const collector = message.channel.createMessageCollector(filter);

      collector.on('collect', m => {
        if (m.content == 'YES') {
          initialize.teams(client);
          message.channel.send('All teams successfully cleared.');          
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
    const team_list = new RichEmbed();
    
    team_list.setAuthor(pl_name, pl_icon, inv)
         .setColor(role_color)
         .setDescription('List of all active teams within PL.')
         .setThumbnail(pl_icon)
         .setFooter(client.user.username, client.user.avatarURL);

    for (let i = 1; i < teams.length; i++) {
      let player_list = teams[i].players.length > 1 ? teams[i].players.slice(1).join(', ') : 'N/A';
      team_list.addField(`__${teams[i].name}__`, `Manager: <@${teams[i].manager_id}>\nPlayers: ${player_list}`);
    }

    message.channel.send(team_list);
  }
});