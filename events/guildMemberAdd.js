const config = require('../config.json');
const sqlite = require('sqlite');

const devs = [
  // Vesper
  '191333046786588672'
];

const servers = [
  // PB2 Official
  '328650645793931267',
  // PL Server
  '310995545588105217',
  // Vesper Server
  '362729317077221377',
  // Art Editors
  '372490159649718274'
];

exports.run = ((client, member) => {
  if (!servers.includes(member.guild.id)) return;
  // if (devs.includes(member.user.id)) return;

  const today = new Date();
  const formatted_date = today.toLocaleString('en-US', config.date_options) + ', ' + today.toLocaleTimeString();
  const join_message = `<@${member.user.id}> has joined \`${member.guild.name}\` (on ${formatted_date})`;

  client.guilds.get(config.bot_server.id).channels.get(config.bot_server.mod.servers).send(join_message);

  // PL Server
  if (member.guild.id != servers[1] && member.guild.id != servers[3]) return;

  const verified_ID = '421819247988310026';
  const spectators_ID = '319613891208282112';

  const add_required_role = (data => {
    const verified = member.guild.id == servers[1] ? verified_ID : member.guild.roles.find('name', 'Account Verified');
    const spectators = member.guild.id == servers[1] ? spectators_ID : member.guild.roles.find('name', 'Spectators');

    if (!verified || !spectators) return console.log(`Insufficient roles to autorole in ${member.guild.name} (${member.guild.id})`);

    if (!data) {
      // not in database
      member.addRole(spectators).catch(err => {
        console.log(`Unable to add "Spectators" role to ${message.author.tag}`)
      });
    } else {
      // in database
      member.setNickname(data.name, 'PL Registration').catch(err => {
        console.log(`Unable to set nickname ${data.name} to ${message.author.tag}`);
      });
  
      member.addRole(verified).catch(err => {
        console.log(`Unable to add "Account Verified" role to ${message.author.tag}`)
      });
  
      member.removeRole(spectators).catch(err => {
        console.log(err);
        console.log(`Unable to remove "Spectators" role from ${message.author.tag}`)
      });

      member.guild.channels.get('422149991482785812').send(`<@${member.user.id}> has joined and been given the <@&${verified_ID}> role.`);
      member.user.send(`Since you are already registered as ${data.name}, you have been given the Account Verified role in ${member.guild.name}!`);
    }
  });

  sqlite.open(`./${config.db}`).then(() => {
    sqlite.get(`SELECT * FROM players where discord_id=\"${member.user.id}\"`).then(row => {
      add_required_role(row);
    });
  });
});