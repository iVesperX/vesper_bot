const Discord = require('discord.js');

// const reactor = require('../util/reactor.js');
const config = require('../config.json');
const sqlite = require('sqlite');

exports.run = ((client, message, args) => {
  const reset_flag = '-r';

  const pl_server = client.guilds.get('310995545588105217');
  const pl_name = pl_server.name;
  const pl_icon = pl_server.iconURL;
  const pl_invite = '';

  const role_color = !message.guild.me.displayColor ? 12172222 : message.guild.me.displayColor;

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get('SELECT * FROM teams').then(row => {
      if (reset_flag == args[0]) {
        if (message.author.id != config.ownerID) return;

        if (!row) return message.channel.send('There are no teams to clear.');

        message.channel.send('Are you sure you want to remove all teams? Type \`YES\` to confirm or \`NO\` to cancel this query.\n\n*__Note__: This action can not be undone.*').then(() => {
          const filter = (new_message => message.author.id == new_message.author.id);
          const collector = message.channel.createMessageCollector(filter);
  
          collector.on('collect', m => {
            if (m.content == 'YES') {
              sqlite.run('DELETE FROM teams').then(() => {
                sqlite.run(`UPDATE players SET team_name="-"`).then(() => {
                  message.channel.send('All teams successfully cleared.');
                });
              }).catch(err => {
                if (err) console.log(err);
                return message.channel.send('Unable to clear teams list.');
              });
              
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
        const teams = new Discord.RichEmbed();
        
        teams.setAuthor(pl_name, pl_icon, pl_invite)
             .setColor(role_color)
             .setDescription('List of all active teams within PL.')
             .setThumbnail(pl_icon)
             .setFooter(client.user.tag, client.user.avatarURL)
             .setTimestamp(new Date());

        sqlite.each('SELECT * FROM teams', (err, row) => {
          let players = /^\[.*\]$/.test(row.players) ? JSON.parse(row.players) : 'N/A';

          if (typeof players == 'object') {
            players = players.join(', ');
          }

          teams.addField(`__${row.team_name}__`, `Manager: <@${row.manager_id}>\nPlayers: ${players}`);
        }).then(() => {
          message.channel.send(teams);
        }).catch(err => {
          console.log(err);
        });
      }
    }).catch(err => {
      console.log(err);
    });
  });
});